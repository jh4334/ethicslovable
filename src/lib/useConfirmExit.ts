import { useEffect } from "react";

/**
 * 게임 도중 브라우저 '뒤로 가기'로 진행이 소리 없이 사라지는 것을 막는다.
 * (이 앱은 의도적으로 게임 상태를 저장하지 않으므로, 실수로 뒤로 가면
 *  처음부터 다시 해야 한다.) active인 동안 뒤로 가기를 한 번 가로채
 *  확인 창을 띄우고, 머무르면 그대로 두고 나가겠다면 실제로 이동한다.
 *
 * HashRouter와의 호환: 진입 시 같은 주소를 히스토리에 한 칸 더 쌓아 두어
 * '뒤로' 한 번이 이 가드에 먼저 걸리게 한다. 확인 창을 취소하면 다시 한 칸
 * 쌓아 가드를 유지하고, 확인하면 리스너를 떼고 두 칸 뒤로 이동한다.
 */
export function useConfirmExit(active: boolean, message: string): void {
  useEffect(() => {
    if (!active) return;

    let leaving = false;
    window.history.pushState(null, "", window.location.href);

    const onPop = () => {
      if (leaving) return;
      const leave = window.confirm(message);
      if (leave) {
        leaving = true;
        window.removeEventListener("popstate", onPop);
        // 가드로 쌓은 칸 + 원래 뒤로 = 두 칸 뒤로 나간다
        window.history.go(-1);
      } else {
        // 머무르기: 가드 칸을 다시 쌓아 다음 뒤로 가기도 가로챈다
        window.history.pushState(null, "", window.location.href);
      }
    };

    window.addEventListener("popstate", onPop);
    return () => window.removeEventListener("popstate", onPop);
  }, [active, message]);
}
