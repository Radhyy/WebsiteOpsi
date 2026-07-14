// src/lib/groq.js
export class GroqLoadBalancer {
  constructor() {
    // Parse keys from environment variable, fallback to empty array
    const keysStr = process.env.GROQ_KEYS || '';
    this.keys = keysStr.split(',').map(k => k.trim()).filter(k => k);
    this.currentIndex = 0;
  }

  // Get the current key
  getCurrentKey() {
    if (this.keys.length === 0) throw new Error('No Groq API keys configured');
    return this.keys[this.currentIndex];
  }

  // Move to the next key
  rotateKey() {
    this.currentIndex = (this.currentIndex + 1) % this.keys.length;
    console.log(`[Groq AI] Rotating to API Key Index: ${this.currentIndex + 1}/${this.keys.length}`);
  }

  // Execute a fetch request with retries on rate limits
  async fetchWithFallback(url, options, maxRetries = this.keys.length) {
    let retries = 0;

    while (retries < maxRetries) {
      const currentKey = this.getCurrentKey();
      
      // Inject Authorization header
      const headers = {
        ...options.headers,
        'Authorization': `Bearer ${currentKey}`,
        'Content-Type': 'application/json'
      };

      try {
        const response = await fetch(url, { ...options, headers });

        // If rate limited (429) or service unavailable (503), rotate and retry
        if (response.status === 429 || response.status === 503) {
          console.warn(`[Groq AI] Key ${this.currentIndex + 1} hit rate limit (${response.status}). Switching key...`);
          this.rotateKey();
          retries++;
          continue;
        }

        if (!response.ok) {
          const errorText = await response.text();
          throw new Error(`Groq API Error: ${response.status} ${errorText}`);
        }

        return await response.json();
      } catch (error) {
        console.error(`[Groq AI] Request failed on key ${this.currentIndex + 1}: ${error.message}`);
        this.rotateKey();
        retries++;
      }
    }

    throw new Error('All Groq API keys have been exhausted or failed.');
  }

  // Helper method to generate text using standard OpenAI chat completions format
  async generateChat(messages, model = 'llama-3.3-70b-versatile', temperature = 0.7) {
    const url = 'https://api.groq.com/openai/v1/chat/completions';
    const body = JSON.stringify({
      model,
      messages,
      temperature,
      response_format: { type: 'json_object' } // Force JSON response
    });

    const data = await this.fetchWithFallback(url, { method: 'POST', body });
    return data.choices[0].message.content;
  }
}

// Export a singleton instance
export const groqAI = new GroqLoadBalancer();
