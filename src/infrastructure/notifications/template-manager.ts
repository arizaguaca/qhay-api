import fs from 'fs';
import path from 'path';

export interface EmailTemplate {
  subject: string;
  body: string;
}

export class TemplateManager {
  private templates: any;

  constructor() {
    this.loadTemplates();
  }

  private loadTemplates() {
    const filePath = path.join(__dirname, '../../config/templates.json');
    const fileContent = fs.readFileSync(filePath, 'utf-8');
    this.templates = JSON.parse(fileContent);
  }

  getSMS(event: string, variables: Record<string, string>): string {
    const template = this.templates[event]?.sms;
    if (!template) throw new Error(`SMS template not found for event: ${event}`);
    return this.interpolate(template, variables);
  }

  getWSP(event: string, variables: Record<string, string>): string {
    const template = this.templates[event]?.wsp;
    if (!template) throw new Error(`WhatsApp template not found for event: ${event}`);
    return this.interpolate(template, variables);
  }

  getEmail(event: string, variables: Record<string, string>): EmailTemplate {
    const template = this.templates[event]?.email;
    if (!template) throw new Error(`Email template not found for event: ${event}`);
    
    return {
      subject: this.interpolate(template.subject, variables),
      body: this.interpolate(template.body, variables)
    };
  }

  private interpolate(template: string, variables: Record<string, string>): string {
    return template.replace(/{{(\w+)}}/g, (_, key) => {
      return variables[key] || `{{${key}}}`;
    });
  }
}
