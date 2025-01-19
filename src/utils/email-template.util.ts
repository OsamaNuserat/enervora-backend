import * as ejs from 'ejs';
import * as path from 'path';

export async function renderEmailTemplate(templateName: string, data: any): Promise<string> {
    const templatePath = path.join(process.cwd(), 'src/mail/templates', `${templateName}.ejs`);
    return ejs.renderFile(templatePath, data);
}
