// src/services/openai.service.ts - Version axios
import { Injectable, ServiceUnavailableException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import axios from 'axios';

@Injectable()
export class OpenAIService {
  constructor(private configService: ConfigService) {}

  async generateSummary(title: string, authorName: string, year: number): Promise<string> {
    const apiKey = this.configService.get('OPENAI_API_KEY');
    const baseUrl = this.configService.get('OPENAI_BASE_URL', 'https://api.openai.com/v1');
    const model = this.configService.get('OPENAI_MODEL', 'gpt-3.5-turbo');
    
    // Mode mock pour les tests sans clé API
    if (!apiKey || apiKey === 'votre_cle_api_ici') {
      return `${title} de ${authorName} (${year}) : Un chef-d'œuvre de la littérature.`;
    }
    
    try {
      const response = await axios.post(
        `${baseUrl}/chat/completions`,
        {
          model,
          messages: [
            {
              role: 'system',
              content: 'Tu es un expert en littérature. Tu génères des résumés concis en français. Maximum 3 phrases.',
            },
            {
              role: 'user',
              content: `Génère un résumé pour le livre "${title}" de ${authorName} (${year}).`,
            },
          ],
          max_tokens: 150,
          temperature: 0.7,
        },
        {
          headers: {
            'Authorization': `Bearer ${apiKey}`,
            'Content-Type': 'application/json',
          },
          timeout: 30000,
        },
      );
      
      // Utilisation de any pour éviter les erreurs de typage
      const data = response.data as any;
      if (data.choices && data.choices[0] && data.choices[0].message) {
        return data.choices[0].message.content.trim();
      }
      
      throw new Error('No response from OpenAI');
    } catch (error) {
      console.error('OpenAI API error:', error.message);
      throw new ServiceUnavailableException('Service OpenAI indisponible');
    }
  }

  async extractKeywords(description: string): Promise<string[]> {
    const apiKey = this.configService.get('OPENAI_API_KEY');
    const baseUrl = this.configService.get('OPENAI_BASE_URL', 'https://api.openai.com/v1');
    const model = this.configService.get('OPENAI_MODEL', 'gpt-3.5-turbo');
    
    if (!apiKey || apiKey === 'votre_cle_api_ici') {
      return description.toLowerCase().split(' ').filter(w => w.length > 3).slice(0, 5);
    }
    
    try {
      const response = await axios.post(
        `${baseUrl}/chat/completions`,
        {
          model,
          messages: [
            {
              role: 'system',
              content: 'Extrait les mots-clés et réponds uniquement avec un tableau JSON. Exemple: ["mot1", "mot2"]',
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
          timeout: 15000,
        },
      );
      
      const data = response.data as any;
      if (data.choices && data.choices[0] && data.choices[0].message) {
        let keywords = data.choices[0].message.content;
        keywords = keywords.replace(/```json/g, '').replace(/```/g, '').trim();
        
        try {
          const parsed = JSON.parse(keywords);
          return Array.isArray(parsed) ? parsed.slice(0, 10) : [];
        } catch {
          return [];
        }
      }
      
      return [];
    } catch (error) {
      console.error('Keyword extraction error:', error.message);
      return [];
    }
  }
}