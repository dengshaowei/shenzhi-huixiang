export const ALLOWED_PROJECT_EXTENSIONS = ["pdf", "docx", "md", "txt"] as const;
export const MAX_PROJECT_FILE_SIZE = 10 * 1024 * 1024;
export const PROJECT_IMPORT_CONFIRM_TEXT = "开始分析";
export const PRIVATE_PROJECT_TITLE = "个人项目";
export const PRIVATE_PROJECT_FILE_LABEL = "原文件名已隐藏";

export interface ProjectFileCandidate {
  readonly name: string;
  readonly path: string;
  readonly size: number;
}

export interface ValidatedProjectFile extends ProjectFileCandidate {
  readonly extension: typeof ALLOWED_PROJECT_EXTENSIONS[number];
}

function extensionOf(fileName: string): string {
  return fileName.includes(".") ? fileName.split(".").pop()?.toLocaleLowerCase() ?? "" : "";
}

export function validateProjectFile(file: ProjectFileCandidate): ValidatedProjectFile {
  const extension = extensionOf(file.name);
  if (!ALLOWED_PROJECT_EXTENSIONS.includes(extension as typeof ALLOWED_PROJECT_EXTENSIONS[number])) {
    throw new Error("仅支持 PDF、DOCX、Markdown 和 TXT 文件");
  }
  if (file.size <= 0 || file.size > MAX_PROJECT_FILE_SIZE) {
    throw new Error("文件需要大于 0 且小于 10 MB");
  }
  if (!file.path.trim()) throw new Error("无法读取所选文件");
  return { ...file, extension: extension as typeof ALLOWED_PROJECT_EXTENSIONS[number] };
}

export function anonymousProjectFileName(extension: ValidatedProjectFile["extension"]): string {
  return `${PRIVATE_PROJECT_TITLE}.${extension}`;
}
