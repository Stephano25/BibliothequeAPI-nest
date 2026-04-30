import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import axios from 'axios';

@Injectable()
export class OpenAIService {
  constructor(private configService: ConfigService) {}

  async generateSummary(title: string, authorName: string, year: number): Promise<string> {
    const apiKey = this.configService.get('OPENAI_API_KEY');
    const baseUrl = this.configService.get('OPENAI_BASE_URL', 'https://api.openai.com/v1');
    const model = this.configService.get('OPENAI_MODEL', 'gpt-3.5-turbo');
    
    try {
      const response = await axios.post(
        `${baseUrl}/chat/completions`,
        {
          model,
          messages: [
            {
              role: 'system',
              content: 'Tu es un expert en littérature. Tu génères des résumés concis et accrocheurs pour des fiches de bibliothèque. Réponds toujours en français. Maximum 3 phrases.',
            },
            {
              role: 'user',
              content: `Génère un résumé pour le livre intitulé "${title}" écrit par ${authorName}, publié en ${year}.`,
            },
          ],
          max_tokens: 200,
          temperature: 0.7,
        },
        {
          headers: {
            'Authorization': `Bearer ${apiKey}`,
            'Content-Type': 'application/json',
          },
        },
      );
      
      return response.data.choices[0].message.content.trim();
    } catch (error) {
      throw new Error('OpenAI API error');
    }
  }

  async extractKeywords(description: string): Promise<string[]> {
    const apiKey = this.configService.get('OPENAI_API_KEY');
    const baseUrl = this.configService.get('OPENAI_BASE_URL', 'https://api.openai.com/v1');
    const model = this.configService.get('OPENAI_MODEL', 'gpt-3.5-turbo');
    
    try {
      const response = await axios.post(
        `${baseUrl}/chat/completions`,
        {
          model,
          messages: [
            {
              role: 'system',
              content: 'Extrait les mots-clés de recherche (auteur, titre, genre, année) à partir de la description. Réponds uniquement avec un tableau JSON des mots-clés. Exemple: ["mot1", "mot2"]',
            },
            {
              role: 'user',
              content: `Extrait les mots-clés pour: "${description}"`,
            },
          ],
          max_tokens: 100,
          temperature: 0.3,
        },
        {
          headers: {
            'Authorization': `Bearer ${apiKey}`,
            'Content-Type': 'application/json',
          },
        },
      );
      
      const keywords = JSON.parse(response.data.choices[0].message.content);
      return Array.isArray(keywords) ? keywords : [];
    } catch (error) {
      return [];
    }
  }
}