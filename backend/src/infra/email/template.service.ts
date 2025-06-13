import fs from 'fs';
import path from 'path';
import Handlebars from 'handlebars';
import { mailtrapConfig } from '@config/email.config';
import { TemplateNames, TemplateWithPayload } from './types';

export class TemplateService<T extends TemplateNames> {
  #templatesDir: string;

  constructor(templatesDir: string) {
    this.#templatesDir = this.#resolveTemplateDirectory(templatesDir);
  }

  #resolveTemplateDirectory(templatesDir: string): string {
    const resolvedPath = this.#getTemplateResolvedPath(templatesDir);

    this.#validateTemplateDirectory(resolvedPath);

    return resolvedPath;
  }

  #validateTemplateDirectory(resolvedPath: string) {
    if (!mailtrapConfig.templateDir?.trim()) {
      throw new Error('Template directory is not configured in mailtrapConfig');
    }

    if (!fs.existsSync(resolvedPath)) {
      throw new Error(`Template directory does not exist: ${resolvedPath}`);
    }
  }

  #getTemplateResolvedPath(templateDir: string): string {
    return path.join(__dirname, templateDir);
  }

  #loadTemplate(templateName: T) {
    const baseTemplatePath = path.join(
      this.#templatesDir,
      `${templateName}.hbs`
    );
    const baseTemplateContent = fs.readFileSync(baseTemplatePath, 'utf-8');
    return Handlebars.compile(baseTemplateContent);
  }

  renderTemplate(templateName: T, data: TemplateWithPayload<T>): string {
    // load the base template and the specific child template
    const baseTemplate = this.#loadTemplate(TemplateNames.BASE as T);
    const childTemplate = this.#loadTemplate(templateName);

    // Render the child template with data
    const childHtmlContent = childTemplate(data);

    // Insert the rendered content into the base template
    return baseTemplate({ ...data, content: childHtmlContent });
  }
}
