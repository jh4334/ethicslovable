#!/usr/bin/env node
/**
 * 콘텐츠 검증 스크립트 (순수 Node, 의존성 없음)
 *
 * src/content/*.json 16개를 읽어
 *   (a) JSON 유효성
 *   (b) 게임별 필수 최상위 키 존재·id 참조 무결성
 *   (c) 각 게임 로직 파일에서 도출한 '숨은 불변식'
 * 을 검사한다. 하나라도 어기면 파일·위치·이유를 출력하고 exit 1.
 *
 * 규칙은 모두 src/games/<id>/{use*Game.ts,logic.ts,judge.ts,format.ts}의
 * 실제 계약에서 도출했다(추측 금지). 계약이 애매한 게임은 구조 검증만 하고
 * 불변식은 주석으로 건너뛴 이유를 남긴다.
 *
 * 배포본 교사 편집 방어용: 교사가 data/*.json(=src/content 복사본)을 잘못 고쳐
 * 오답·무한루프·빈 화면을 만들기 전에 CI에서 걸러 낸다.
 */
import { readFileSync, readdirSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, join, resolve } from "node:path";

const __dirname = dirname(fileURLToPath(import.meta.url));
const CONTENT_DIR = resolve(__dirname, "..", "src", "content");

const errors = [];
const warnings = [];
/** 오류(배포 차단) */
function err(file, where, reason) {
  errors.push({ file, where, reason });
}
/** 경고(배포는 허용, 안내만) */
function warn(file, where, reason) {
  warnings.push({ file, where, reason });
}

const isObj = (v) => v != null && typeof v === "object" && !Array.isArray(v);
const isArr = Array.isArray;
const isNum = (v) => typeof v === "number" && Number.isFinite(v);
const isStr = (v) => typeof v === "string";

/** 배열 items에서 size개를 뽑는 조합을 하나씩 넘긴다(콜백이 true 반환 시 조기 종료). */
function someCombination(items, size, test) {
  const n = items.length;
  if (size > n) return false;
  const idx = Array.from({ length: size }, (_, i) => i);
  for (;;) {
    if (test(idx.map((i) => items[i]))) return true;
    // 다음 조합
    let k = size - 1;
    while (k >= 0 && idx[k] === n - size + k) k--;
    if (k < 0) return false;
    idx[k]++;
    for (let j = k + 1; j < size; j++) idx[j] = idx[j - 1] + 1;
  }
}

/** 최상위 필수 키 존재 확인 (현 콘텐츠에서 도출한 게임별 스키마 골격) */
function requireKeys(file, data, keys) {
  if (!isObj(data)) {
    err(file, "(root)", "최상위가 객체가 아니에요.");
    return false;
  }
  let ok = true;
  for (const k of keys) {
    if (!(k in data)) {
      err(file, `(root).${k}`, "필수 최상위 키가 없어요.");
      ok = false;
    }
  }
  return ok;
}

/** 공통: 교사용 안내($설명 또는 동등) 존재 여부는 경고만 */
function checkGuide(file, data) {
  if (isObj(data) && !("$설명" in data)) {
    warn(file, "(root).$설명", "교사용 편집 안내($설명)가 없어요(권장).");
  }
}

/* ------------------------------------------------------------------ *
 *  게임별 검증기
 *  key = 콘텐츠 파일 이름(확장자 제외) = 게임 id
 * ------------------------------------------------------------------ */
const VALIDATORS = {
  /**
   * gacha-box (뽑기 상자의 비밀)
   * 계약: useGachaGame.rollRarity는 누적 확률 분포를 쓰고, draw()는
   *   rarity.pool[floor(random*pool.length)]로 아이템을 뽑는다.
   * 불변식: rarities 확률 합 = 1(±1e-6), 각 확률 > 0, 각 pool 비어 있지 않음.
   */
  "gacha-box"(file, d) {
    if (!requireKeys(file, d, [
      "intro", "shop", "rarities", "nearMiss", "probabilityReveal",
      "tricks", "scenario", "checklist", "grades", "result",
    ])) return;

    if (!isArr(d.rarities) || d.rarities.length === 0) {
      err(file, "rarities", "등급 배열이 비어 있어요.");
      return;
    }
    let sum = 0;
    d.rarities.forEach((r, i) => {
      const at = `rarities[${i}]`;
      if (!isObj(r)) { err(file, at, "등급 항목이 객체가 아니에요."); return; }
      if (!isStr(r.key)) err(file, `${at}.key`, "key(문자열)가 없어요.");
      if (!isNum(r.probability)) {
        err(file, `${at}.probability`, "probability(숫자)가 없어요.");
      } else {
        if (r.probability <= 0) {
          err(file, `${at}.probability`, `확률은 0보다 커야 해요(현재 ${r.probability}).`);
        }
        sum += r.probability;
      }
      if (!isArr(r.pool) || r.pool.length === 0) {
        err(file, `${at}.pool`, "pool이 비어 있으면 뽑기 결과가 undefined가 돼요.");
      }
    });
    if (Math.abs(sum - 1) > 1e-6) {
      err(file, "rarities[].probability", `확률 합이 1이 아니에요(현재 ${sum}).`);
    }

    // quiz.answerIndex 범위(구조 검증)
    const q = d.probabilityReveal?.quiz;
    if (isObj(q) && isArr(q.choices) && isNum(q.answerIndex)) {
      if (q.answerIndex < 0 || q.answerIndex >= q.choices.length) {
        err(file, "probabilityReveal.quiz.answerIndex",
          `보기 범위를 벗어났어요(0~${q.choices.length - 1}).`);
      }
    }
  },

  /**
   * ai-fair (모두의 AI)
   * 계약: useAiFairGame.computeEnabled — 사용자는 canUseBaseline이거나,
   *   barrierId!=="" 이고 (남긴 개선들의 helpsBarrierIds 합집합)이 그 장벽을
   *   덮으면 '쓸 수 있음'. 최종 심사 통과 = 전원(users.length) 쓸 수 있음.
   *   finalBudget = clamp(finalStage.budget, 1, improvements.length).
   * 불변식:
   *   - barrierId·helpsBarrierIds·stageOrder의 id 참조 무결성
   *   - stageOrder는 '장벽 있는 user'만 가리켜야 함
   *   - budget개 조합 중 전원 쓸 수 있는 조합이 최소 1개 존재(브루트포스)
   */
  "ai-fair"(file, d) {
    if (!requireKeys(file, d, [
      "meta", "users", "stageOrder", "barriers", "improvements",
      "finalStage", "insight", "rules", "grades", "ui",
    ])) return;
    if (!isArr(d.users) || !isArr(d.barriers) || !isArr(d.improvements) ||
        !isArr(d.stageOrder) || !isObj(d.finalStage)) {
      err(file, "(root)", "users/barriers/improvements/stageOrder/finalStage 형태가 올바르지 않아요.");
      return;
    }

    const barrierIds = new Set(d.barriers.map((b) => b?.id).filter(isStr));
    const userById = new Map(d.users.map((u) => [u?.id, u]));

    // users: barrierId 참조 무결성
    d.users.forEach((u, i) => {
      const at = `users[${i}]`;
      if (!isObj(u)) { err(file, at, "user 항목이 객체가 아니에요."); return; }
      if (!isStr(u.id)) err(file, `${at}.id`, "id가 없어요.");
      if (u.barrierId !== "" && !barrierIds.has(u.barrierId)) {
        err(file, `${at}.barrierId`, `barriers에 없는 장벽 id예요('${u.barrierId}').`);
      }
    });

    // improvements: helpsBarrierIds 참조 무결성
    d.improvements.forEach((imp, i) => {
      const at = `improvements[${i}]`;
      if (!isObj(imp)) { err(file, at, "improvement 항목이 객체가 아니에요."); return; }
      if (!isArr(imp.helpsBarrierIds)) {
        err(file, `${at}.helpsBarrierIds`, "배열이 아니에요.");
        return;
      }
      imp.helpsBarrierIds.forEach((bid) => {
        if (!barrierIds.has(bid)) {
          err(file, `${at}.helpsBarrierIds`, `barriers에 없는 장벽 id예요('${bid}').`);
        }
      });
    });

    // stageOrder: 존재하는 user + 장벽 있는 user만
    d.stageOrder.forEach((id, i) => {
      const u = userById.get(id);
      if (!u) {
        err(file, `stageOrder[${i}]`, `users에 없는 id예요('${id}').`);
      } else if (u.barrierId === "" || !isStr(u.barrierId)) {
        err(file, `stageOrder[${i}]`, `장벽 없는(기본) user는 손님이 될 수 없어요('${id}').`);
      }
    });

    // 최종 심사 solvability 브루트포스
    if (!isNum(d.finalStage.budget)) {
      err(file, "finalStage.budget", "budget(숫자)이 없어요.");
      return;
    }
    const budget = Math.min(Math.max(1, d.finalStage.budget), d.improvements.length);
    const users = d.users;
    const canSolve = someCombination(d.improvements, budget, (combo) => {
      const fixed = new Set();
      for (const imp of combo) {
        if (isArr(imp.helpsBarrierIds)) for (const b of imp.helpsBarrierIds) fixed.add(b);
      }
      return users.every(
        (u) => u.canUseBaseline || (u.barrierId !== "" && fixed.has(u.barrierId)),
      );
    });
    if (!canSolve) {
      err(file, "finalStage / improvements",
        `개선 ${budget}개로 전원(${users.length}명)이 쓸 수 있는 조합이 없어요 — 최종 심사를 통과할 수 없어요.`);
    }
  },

  /**
   * ai-grow (AI와 함께 크는 나)
   * 계약: useAiGrowGame — question/develop 잠금은 requiresKnowledgeId로,
   *   질문→답 연결은 botAnswerId로, 오류 잡기는 botAnswer.errorSpan을
   *   text.split("\n")의 한 줄과 정확히 비교해 판정한다.
   * 불변식(미션마다):
   *   - question/develop/recall/botAnswer의 requiresKnowledgeId ∈ knowledgeCards[].id
   *   - question.botAnswerId ∈ botAnswers[].id
   *   - botAnswer.errorSpan 이 botAnswer.text.split("\n") 안에 정확히 존재
   */
  "ai-grow"(file, d) {
    if (!requireKeys(file, d, [
      "intro", "missions", "finale", "promises", "grades", "labels",
    ])) return;
    if (!isArr(d.missions)) { err(file, "missions", "배열이 아니에요."); return; }

    d.missions.forEach((m, mi) => {
      const at = `missions[${mi}]`;
      if (!isObj(m)) { err(file, at, "mission 항목이 객체가 아니에요."); return; }
      const kIds = new Set((isArr(m.knowledgeCards) ? m.knowledgeCards : [])
        .map((k) => k?.id).filter(isStr));
      const aIds = new Set((isArr(m.botAnswers) ? m.botAnswers : [])
        .map((a) => a?.id).filter(isStr));
      const reqCheck = (rid, where) => {
        if (rid != null && rid !== "" && !kIds.has(rid)) {
          err(file, where, `knowledgeCards에 없는 지식 id예요('${rid}').`);
        }
      };

      (isArr(m.questions) ? m.questions : []).forEach((q, qi) => {
        const qat = `${at}.questions[${qi}]`;
        reqCheck(q?.requiresKnowledgeId, `${qat}.requiresKnowledgeId`);
        if (!aIds.has(q?.botAnswerId)) {
          err(file, `${qat}.botAnswerId`, `botAnswers에 없는 답 id예요('${q?.botAnswerId}').`);
        }
      });

      (isArr(m.botAnswers) ? m.botAnswers : []).forEach((a, ai) => {
        const aat = `${at}.botAnswers[${ai}]`;
        reqCheck(a?.requiresKnowledgeId, `${aat}.requiresKnowledgeId`);
        if (!isStr(a?.text) || !isStr(a?.errorSpan)) {
          err(file, aat, "text·errorSpan(문자열)이 필요해요.");
          return;
        }
        const lines = a.text.split("\n");
        if (!lines.includes(a.errorSpan)) {
          err(file, `${aat}.errorSpan`,
            "errorSpan이 text.split(\"\\n\")의 한 줄과 정확히 일치하지 않아요 — 오류를 절대 잡을 수 없어요.");
        }
      });

      const choices = m.develop?.choices;
      (isArr(choices) ? choices : []).forEach((c, ci) => {
        reqCheck(c?.requiresKnowledgeId, `${at}.develop.choices[${ci}].requiresKnowledgeId`);
      });
      reqCheck(m.recall?.requiresKnowledgeId, `${at}.recall.requiresKnowledgeId`);
    });
  },

  /**
   * fact-check (누리봇 사실 검증단)
   * 계약: useFactCheckGame.verify — round.sentences.findIndex(isFalse)로
   *   '첫 번째' 거짓 문장만 정답으로 삼는다. 거짓이 2개 이상이면 두 번째
   *   거짓을 골라도 오답 처리되는 모순이 생긴다.
   * 불변식: 각 round의 isFalse=true 개수 ≤ 1.
   *   덤: 거짓 문장의 evidenceKey는 evidence[].key를 가리켜야 함(참조 무결성).
   */
  "fact-check"(file, d) {
    if (!requireKeys(file, d, [
      "intro", "rules", "rounds", "grades", "resultSummary",
      "nuribotReactions", "labels",
    ])) return;
    if (!isArr(d.rounds)) { err(file, "rounds", "배열이 아니에요."); return; }

    d.rounds.forEach((r, ri) => {
      const at = `rounds[${ri}]`;
      if (!isObj(r) || !isArr(r.sentences)) {
        err(file, `${at}.sentences`, "문장 배열이 없어요.");
        return;
      }
      const falseCount = r.sentences.filter((s) => s?.isFalse === true).length;
      if (falseCount > 1) {
        err(file, `${at}.sentences`,
          `거짓(isFalse) 문장이 ${falseCount}개예요 — 게임은 첫 번째만 정답 처리해서 나머지는 잡아도 오답이 돼요.`);
      }
      const evKeys = new Set((isArr(r.evidence) ? r.evidence : [])
        .map((e) => e?.key).filter(isStr));
      r.sentences.forEach((s, si) => {
        if (s?.isFalse === true && s.evidenceKey != null && !evKeys.has(s.evidenceKey)) {
          err(file, `${at}.sentences[${si}].evidenceKey`,
            `evidence에 없는 근거 key예요('${s.evidenceKey}').`);
        }
      });
    });
  },

  /**
   * feed-algorithm (알고리즘 설계자)
   * 계약: logic.checkGameOver — STAT_KEYS(eng/safe/profit/trust) 각각에 대해
   *   값이 0 이하면 {stat, bound:"low"}, 100 이상이면 {stat, bound:"high"}
   *   엔딩을 gameOverEndings에서 find로 찾는다. 없으면 게임오버가 무반응.
   * 불변식: (stat × bound) 8조합 게임오버 엔딩이 전수 존재.
   */
  "feed-algorithm"(file, d) {
    if (!requireKeys(file, d, [
      "meta", "stats", "intro", "tutorial", "cards",
      "gameOverEndings", "playStyles", "result", "reflection",
    ])) return;
    if (!isArr(d.gameOverEndings)) {
      err(file, "gameOverEndings", "배열이 아니에요.");
      return;
    }
    const STAT_KEYS = ["eng", "safe", "profit", "trust"];
    const BOUNDS = ["low", "high"];
    const seen = new Set(
      d.gameOverEndings
        .filter((e) => isObj(e))
        .map((e) => `${e.stat}:${e.bound}`),
    );
    for (const stat of STAT_KEYS) {
      for (const bound of BOUNDS) {
        if (!seen.has(`${stat}:${bound}`)) {
          err(file, "gameOverEndings",
            `${stat} 수치가 ${bound === "low" ? "0 이하" : "100 이상"}일 때의 엔딩(${stat}/${bound})이 없어요.`);
        }
      }
    }
  },

  /**
   * data-bias (데이터 편식쟁이 AI)
   * 계약: judge.judgeCard — 시험 카드를 맞히려면 훈련 데이터에 ① 같은 species,
   *   ② requiredVariant를 variantTags에 가진 카드가 둘 다 있어야 한다. 훈련
   *   데이터는 trainingCards 중 8장을 고르는 것이므로, 전체 pool에 둘이 다
   *   없으면 그 문제는 어떤 선택으로도 절대 못 맞힌다.
   * 불변식: round1/round2 각 시험 카드마다 trainingCards에
   *   같은 species 카드 존재 && requiredVariant를 만족하는 카드 존재.
   */
  "data-bias"(file, d) {
    if (!requireKeys(file, d, [
      "meta", "rules", "babyBot", "trainingCards",
      "round1TestCards", "round2TestCards", "rounds", "results", "reflection",
    ])) return;
    if (!isArr(d.trainingCards)) {
      err(file, "trainingCards", "배열이 아니에요.");
      return;
    }
    const species = new Set(d.trainingCards.map((t) => t?.species).filter(isStr));
    const variants = new Set();
    d.trainingCards.forEach((t) => {
      if (isArr(t?.variantTags)) t.variantTags.forEach((v) => variants.add(v));
    });

    for (const roundKey of ["round1TestCards", "round2TestCards"]) {
      const cards = d[roundKey];
      if (!isArr(cards)) { err(file, roundKey, "배열이 아니에요."); continue; }
      cards.forEach((c, i) => {
        const at = `${roundKey}[${i}]`;
        if (!isObj(c)) { err(file, at, "시험 카드가 객체가 아니에요."); return; }
        if (!species.has(c.species)) {
          err(file, `${at}.species`,
            `trainingCards에 같은 종('${c.species}') 데이터가 없어요 — 절대 못 맞혀요.`);
        }
        if (!variants.has(c.requiredVariant)) {
          err(file, `${at}.requiredVariant`,
            `trainingCards의 variantTags에 '${c.requiredVariant}' 특징이 없어요 — 절대 못 맞혀요.`);
        }
      });
    }
  },

  /**
   * data-trail (내 데이터의 여행)
   * 계약: logic.pickAds — pool.find(ad.bait)로 낚시 광고 1장을 가운데 끼운다
   *   (파트 C와 연결). buildProfile — templates[tag] ?? templates.default 로
   *   프로필 문구를 고르므로 default가 없으면 undefined 문구가 뜬다.
   *   ProtectScreen은 choice.isGood으로 방패를 센다.
   * 불변식: adPool의 bait는 정확히 1개, profile.templates.default 존재,
   *   각 protect.scenario에 isGood 선택지가 1개 이상 존재.
   */
  "data-trail"(file, d) {
    if (!requireKeys(file, d, [
      "meta", "feed", "stations", "journey", "profile",
      "adSection", "adPool", "protect", "result",
    ])) return;

    if (!isArr(d.adPool)) {
      err(file, "adPool", "배열이 아니에요.");
    } else {
      const baitCount = d.adPool.filter((a) => a?.bait === true).length;
      if (baitCount !== 1) {
        err(file, "adPool", `낚시 광고(bait)는 정확히 1개여야 해요(현재 ${baitCount}개).`);
      }
    }

    if (!isObj(d.profile?.templates) || !isStr(d.profile.templates.default)) {
      err(file, "profile.templates.default",
        "프로필 기본 문구(default)가 없으면 매칭 실패 시 undefined가 떠요.");
    }

    const scenarios = d.protect?.scenarios;
    if (!isArr(scenarios)) {
      err(file, "protect.scenarios", "배열이 아니에요.");
    } else {
      scenarios.forEach((s, i) => {
        const goods = (isArr(s?.choices) ? s.choices : []).filter((c) => c?.isGood === true).length;
        if (goods < 1) {
          err(file, `protect.scenarios[${i}].choices`,
            "isGood=true인 선택지가 없어요 — 이 상황에서는 방패를 얻을 수 없어요.");
        }
      });
    }
  },

  /* ---------------------------------------------------------------- *
   *  아래 게임들은 순수 계약이 UI 컴포넌트에 흩어져 있어 '숨은 불변식'을
   *  안전하게 단정하기 애매하다. 최상위 구조(필수 키)만 검증하고 깊은
   *  불변식은 의도적으로 건너뛴다(추측 금지 원칙). 필요 시 각 게임의
   *  logic/judge가 순수 함수로 분리되면 이곳에 규칙을 추가한다.
   * ---------------------------------------------------------------- */
  "ai-copyright"(file, d) {
    requireKeys(file, d, [
      "intro", "principles", "round1", "makeRight",
      "promises", "grades", "rules", "labels",
    ]);
  },
  "ai-privacy"(file, d) {
    requireKeys(file, d, [
      "intro", "dangerTypes", "round1", "mistakes",
      "safetyRules", "compare", "grades", "labels",
    ]);
  },
  "chat-guard"(file, d) {
    requireKeys(file, d, [
      "intro", "roomTitle", "memberCount", "members", "episodes",
      "promiseCandidates", "grades", "finale", "labels",
    ]);
  },
  "deepfake"(file, d) {
    requireKeys(file, d, [
      "intro", "eyeTest", "midResult", "tools", "cases",
      "caseRules", "grades", "verificationRules", "result", "labels",
    ]);
  },
  "search-detective"(file, d) {
    requireKeys(file, d, [
      "intro", "rules", "clues", "resultTypeLabels",
      "rounds", "grades", "habits", "labels",
    ]);
  },
  "social-insight"(file, d) {
    requireKeys(file, d, ["meta", "rules", "difficulties", "comboPraise", "categories"]);
  },
  "trend-tycoon"(file, d) {
    requireKeys(file, d, ["intro", "missions", "videos", "grades", "clear", "finalReport"]);
  },

  /**
   * filter-bubble (필터버블 탐지기)
   * 계약: logic.buildPersona — categories[].id로 집계하고 personas의
   *   focused/explorer/single/dual 템플릿을 쓴다. computeRiskScore는
   *   categoryCount>1 일 때만 의미가 있다. items[].category는 category id.
   * 불변식: items[].category ∈ categories[].id, categories 2개 이상,
   *   personas 4종 템플릿 존재, gaugeLevels에 minScore=0 구간 존재.
   */
  "filter-bubble"(file, d) {
    if (!requireKeys(file, d, ["ui", "categories", "personas", "gaugeLevels", "items"])) return;

    if (!isArr(d.categories) || d.categories.length < 2) {
      err(file, "categories", "분야는 2개 이상이어야 위험도 계산이 의미가 있어요.");
    }
    const catIds = new Set((isArr(d.categories) ? d.categories : []).map((c) => c?.id).filter(isStr));
    (isArr(d.items) ? d.items : []).forEach((it, i) => {
      if (!catIds.has(it?.category)) {
        err(file, `items[${i}].category`, `categories에 없는 분야 id예요('${it?.category}').`);
      }
    });
    for (const key of ["focused", "explorer", "single", "dual"]) {
      if (!isObj(d.personas?.[key])) {
        err(file, `personas.${key}`, "성향 템플릿이 없어요.");
      }
    }
    if (isArr(d.gaugeLevels) && !d.gaugeLevels.some((g) => g?.minScore === 0)) {
      err(file, "gaugeLevels", "minScore=0(최저 구간) 항목이 없어요 — 0점일 때 표시할 구간이 없어요.");
    }
  },

  /**
   * short-form (멈출 수 없는 화면)
   * 계약: logic.buildQueue는 videos를 섞어 이어 붙이고, round[0].id 접근이
   *   있어 videos가 비면 크래시. 시간 퀴즈·강제 종료는 rules 값에 의존.
   * 불변식: videos 비어 있지 않음, rules.forceEndAfter > stopChallengeAfter,
   *   quizAfterSwipes는 forceEndAfter 이내(구조 안전).
   */
  "short-form"(file, d) {
    if (!requireKeys(file, d, [
      "intro", "rules", "feedUi", "videos", "timeQuiz",
      "stopChallenge", "designReveal", "grades", "result",
    ])) return;

    if (!isArr(d.videos) || d.videos.length === 0) {
      err(file, "videos", "영상이 비어 있으면 재생 대기열을 만들 수 없어요.");
    }
    const r = d.rules;
    if (isObj(r)) {
      if (isNum(r.forceEndAfter) && isNum(r.stopChallengeAfter) &&
          r.forceEndAfter <= r.stopChallengeAfter) {
        err(file, "rules", `forceEndAfter(${r.forceEndAfter})는 stopChallengeAfter(${r.stopChallengeAfter})보다 커야 해요.`);
      }
      if (isArr(r.quizAfterSwipes) && isNum(r.forceEndAfter)) {
        r.quizAfterSwipes.forEach((n, i) => {
          if (isNum(n) && n > r.forceEndAfter) {
            err(file, `rules.quizAfterSwipes[${i}]`,
              `강제 종료(${r.forceEndAfter}) 이후에 퀴즈(${n})가 잡혀 있어 절대 안 나와요.`);
          }
        });
      }
    }
  },
};

/* ------------------------------------------------------------------ *
 *  실행
 * ------------------------------------------------------------------ */
function main() {
  let files;
  try {
    files = readdirSync(CONTENT_DIR).filter((f) => f.endsWith(".json")).sort();
  } catch (e) {
    console.error(`콘텐츠 폴더를 읽을 수 없어요: ${CONTENT_DIR}\n${e.message}`);
    process.exit(1);
  }

  if (files.length === 0) {
    console.error(`콘텐츠 JSON이 하나도 없어요: ${CONTENT_DIR}`);
    process.exit(1);
  }

  for (const file of files) {
    const id = file.replace(/\.json$/, "");
    let data;
    try {
      data = JSON.parse(readFileSync(join(CONTENT_DIR, file), "utf8"));
    } catch (e) {
      err(file, "(parse)", `JSON 파싱 실패: ${e.message}`);
      continue;
    }
    checkGuide(file, data);
    const validator = VALIDATORS[id];
    if (validator) {
      validator(file, data);
    } else {
      warn(file, "(root)", "검증기가 없는 콘텐츠예요 — 구조 검증을 건너뛰었어요.");
      if (!isObj(data)) err(file, "(root)", "최상위가 객체가 아니에요.");
    }
  }

  if (warnings.length) {
    console.log(`\n⚠️  경고 ${warnings.length}건:`);
    for (const w of warnings) console.log(`  - [${w.file}] ${w.where}: ${w.reason}`);
  }

  if (errors.length) {
    console.error(`\n❌ 콘텐츠 검증 실패 — 오류 ${errors.length}건:`);
    for (const e of errors) console.error(`  - [${e.file}] ${e.where}: ${e.reason}`);
    console.error(`\n${files.length}개 콘텐츠 중 오류가 있어 배포를 막아요. 위 위치를 고쳐 주세요.`);
    process.exit(1);
  }

  console.log(`\n✅ 콘텐츠 검증 통과 — ${files.length}개 파일 이상 없어요.`);
  process.exit(0);
}

main();
