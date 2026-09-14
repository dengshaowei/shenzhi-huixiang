import { findCompetencyDomain } from "../../core/content";
import type { CompetencyDomain, LearningModule } from "../../core/types";
import { learningLibraryRepository, type LearningLibraryItem } from "../../services/learning-library";
import { setStudyContext } from "../../services/study-context";

interface ModuleView extends LearningModule {
  readonly favorite: boolean;
}

interface DomainData {
  domain: CompetencyDomain | null;
  modules: readonly ModuleView[];
  statusLabel: string;
  errorMessage: string;
}

function moduleLibraryItem(domain: CompetencyDomain, module: LearningModule): Omit<LearningLibraryItem, "updatedAt"> {
  return {
    id: `module:${domain.id}/${module.id}`,
    kind: "module",
    title: module.title,
    subtitle: domain.title,
    route: `/pages/domain/index?id=${domain.id}`,
    domainId: domain.id,
    moduleId: module.id,
    knowledgeTerms: module.knowledgeTerms,
  };
}

function moduleViews(domain: CompetencyDomain): readonly ModuleView[] {
  const favoriteIds = new Set(learningLibraryRepository.load().favorites.map((item) => item.id));
  return domain.modules.map((module) => ({ ...module, favorite: favoriteIds.has(`module:${domain.id}/${module.id}`) }));
}

Page<DomainData, WechatMiniprogram.Page.CustomOption>({
  data: {
    domain: null,
    modules: [],
    statusLabel: "",
    errorMessage: "",
  },

  onLoad(query: Record<string, string | undefined>): void {
    const domain = findCompetencyDomain(query.id ?? "");
    if (!domain) {
      this.setData({ errorMessage: "没有找到这个能力领域" });
      return;
    }
    this.setData({
      domain,
      modules: moduleViews(domain),
      statusLabel: domain.available ? "首版课程已开放" : "目录可查看 · 课程准备中",
      errorMessage: "",
    });
    wx.setNavigationBarTitle({ title: domain.title });
    learningLibraryRepository.record({
      id: `domain:${domain.id}`,
      kind: "domain",
      title: domain.title,
      subtitle: domain.summary,
      route: `/pages/domain/index?id=${domain.id}`,
      domainId: domain.id,
      moduleId: "",
      knowledgeTerms: [],
    });
  },

  toggleFavorite(event: WechatMiniprogram.TouchEvent): void {
    const domain = this.data.domain;
    const moduleId = String(event.currentTarget.dataset.id ?? "");
    const learningModule = domain?.modules.find((item) => item.id === moduleId);
    if (!domain || !learningModule) return;
    const library = learningLibraryRepository.toggleFavorite(moduleLibraryItem(domain, learningModule));
    this.setData({ modules: moduleViews(domain) });
    const favorited = library.favorites.some((item) => item.id === `module:${domain.id}/${moduleId}`);
    wx.showToast({ title: favorited ? "已收藏" : "已取消收藏", icon: "none" });
  },

  askModule(event: WechatMiniprogram.TouchEvent): void {
    const domain = this.data.domain;
    const moduleId = String(event.currentTarget.dataset.id ?? "");
    const learningModule = domain?.modules.find((item) => item.id === moduleId);
    if (!domain || !learningModule) return;
    setStudyContext({
      kind: "curriculum",
      domainId: domain.id,
      domainTitle: domain.title,
      moduleId: learningModule.id,
      moduleTitle: learningModule.title,
      knowledgeTerms: learningModule.knowledgeTerms,
      project: null,
    });
    learningLibraryRepository.record(moduleLibraryItem(domain, learningModule));
    wx.switchTab({ url: "/pages/agent/index" });
  },

  startLearning(): void {
    const domain = this.data.domain;
    if (domain?.id === "sensors") {
      wx.navigateTo({ url: "/pages/lesson/index" });
      return;
    }
    const learningModule = domain?.modules[0];
    if (!domain || !learningModule) return;
    setStudyContext({
      kind: "curriculum",
      domainId: domain.id,
      domainTitle: domain.title,
      moduleId: learningModule.id,
      moduleTitle: learningModule.title,
      knowledgeTerms: learningModule.knowledgeTerms,
      project: null,
    });
    wx.switchTab({ url: "/pages/agent/index" });
  },
});
