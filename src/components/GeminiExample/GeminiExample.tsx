import { useState } from 'react';
import { useGemini } from '../../hooks';
import './GeminiExample.scss';

interface GeminiExampleProps {
  initialPrompt?: string;
}

const GeminiExample = ({ initialPrompt = '' }: GeminiExampleProps) => {
  const [prompt, setPrompt] = useState(initialPrompt);
  const [response, setResponse] = useState<string>('');
  const [streamingResponse, setStreamingResponse] = useState<string>('');
  const [isStreaming, setIsStreaming] = useState(false);
  
  const { 
    generateText, 
    streamText, 
    loading, 
    error, 
    clearError 
  } = useGemini({
    temperature: 0.7,
    maxOutputTokens: 800,
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!prompt.trim() || loading) return;
    
    try {
      clearError();
      setResponse('');
      const result = await generateText(prompt);
      setResponse(result);
    } catch (err) {
      console.error('Error generating text:', err);
    }
  };

  const handleStream = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!prompt.trim() || loading || isStreaming) return;
    
    try {
      clearError();
      setStreamingResponse('');
      setIsStreaming(true);
      
      await streamText(
        prompt,
        (chunk) => {
          setStreamingResponse(prev => prev + chunk);
        }
      );
    } catch (err) {
      console.error('Error streaming text:', err);
    } finally {
      setIsStreaming(false);
    }
  };

  return (
    <div className="gemini-example">
      <h2>Gemini AI Text Generation</h2>
      
      <form onSubmit={handleSubmit} className="prompt-form">
        <div className="form-group">
          <label htmlFor="prompt">Enter your prompt:</label>
          <textarea
            id="prompt"
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            placeholder="Type your prompt here..."
            className="form-textarea"
            rows={4}
          />
        </div>
        
        <div className="button-group">
          <button 
            type="submit" 
            className="btn btn-primary"
            disabled={loading || !prompt.trim()}
          >
            {loading ? 'Generating...' : 'Generate Text'}
          </button>
          
          <button 
            type="button" 
            onClick={handleStream}
            className="btn btn-secondary"
            disabled={loading || isStreaming || !prompt.trim()}
          >
            {isStreaming ? 'Streaming...' : 'Stream Response'}
          </button>
        </div>
      </form>
      
      {error && (
        <div className="error-message">
          <p>Error: {error.message}</p>
        </div>
      )}
      
      {response && (
        <div className="response-container">
          <h3>Response:</h3>
          <div className="response-content">
            {response.split('\n').map((line, i) => (
              <p key={i}>{line || <br />}</p>
            ))}
          </div>
        </div>
      )}
      
      {streamingResponse && (
        <div className="response-container streaming">
          <h3>Streaming Response:</h3>
          <div className="response-content">
            {streamingResponse.split('\n').map((line, i) => (
              <p key={i}>{line || <br />}</p>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default GeminiExample;