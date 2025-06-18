import { GeminiExample } from '../../components';

const GeminiDemoPage = () => {
  return (
    <div className="gemini-demo-page">
      <div className="page-header">
        <h1>Gemini AI Integration Demo</h1>
        <p className="description">
          This page demonstrates how to use the Gemini API for text generation in your application.
          Try entering different prompts to see how the AI responds.
        </p>
      </div>
      
      <GeminiExample initialPrompt="Write a short dialogue between two people discussing their weekend plans." />
      
      <div className="usage-examples">
        <h2>Example Use Cases</h2>
        <ul>
          <li>Generate dialogue options for scenarios</li>
          <li>Create personalized feedback for user responses</li>
          <li>Generate alternative responses to show users</li>
          <li>Create new scenario content dynamically</li>
          <li>Analyze user responses for scoring</li>
        </ul>
      </div>
    </div>
  );
};

export default GeminiDemoPage;