import { useConfirmExit } from "@/lib/useConfirmExit";

const DEFAULT_MESSAGE =
  "게임을 그만두고 나갈까요?\n지금까지의 진행은 저장되지 않아서, 다시 오면 처음부터 시작해요.";

/**
 * 화면에는 아무것도 그리지 않고, 마운트되어 있는 동안 '뒤로 가기' 확인만
 * 담당하는 가드. 각 게임의 '플레이 중' 화면에서만 렌더하면 그 화면이
 * 떠 있는 동안(=진행 중)에만 보호가 걸린다. 인트로·결과 화면에는 넣지
 * 않아, 시작 전·완료 후에는 자유롭게 나갈 수 있다.
 */
export default function ExitGuard({ message = DEFAULT_MESSAGE }: { message?: string }) {
  useConfirmExit(true, message);
  return null;
}
