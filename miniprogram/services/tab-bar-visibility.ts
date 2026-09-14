export interface TabBarVisibilityController {
  readonly show: () => void;
  readonly hide: () => void;
}

/** 让原生 TabBar 始终与新手引导状态一致，避免热更新后残留隐藏状态。 */
export function syncTabBarVisibility(needOnboarding: boolean, controller: TabBarVisibilityController): void {
  if (needOnboarding) {
    controller.hide();
    return;
  }
  controller.show();
}
