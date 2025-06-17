import { SupportedChartTypes, type ChartDataResponse } from "../types/chat";


// Connection configuration
const SERVER_URL = 'http://localhost:4000';
const BLANK_STRING = '';

export async function connectToServer(handleChatUpdate: (data: string) => void) {
  try {
    const response = await fetch(`${SERVER_URL}/sse`, {
      method: 'GET',
      mode: 'cors',
      cache: 'no-cache',
      headers: {
        'Content-Type': 'application/json',
      },
    });
    
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    
    const data = await response.json();
    if (data.success) {
      return connectToSSEStream(handleChatUpdate);
    } else {
      throw new Error("Failed to establish connection to server");
    }
  } catch (error) {
    console.warn("MCP server not available, running in offline mode:", error);
    return null;
  }
}

function connectToSSEStream(handleChatUpdate: (data: string) => void) {
  try {
    // Create URL with session ID for potential reconnection handling
    const streamUrl = `${SERVER_URL}/sse/stream`;
    const eventSource = new EventSource(streamUrl);
    
    // Handle connection open
    eventSource.onopen = function() {
      handleChatUpdate("true");
      console.log("SSE stream connection established");
    };
    
    // Handle incoming messages
    eventSource.onmessage = function(event) {
      try {        
        const data = JSON.parse(event.data);
        // Check if this is a connection confirmation message
        if (data.jsonrpc === "2.0" && 
            data.method === "message" && 
            data.params && 
            data.params.type === "connection_response") {
          localStorage.setItem('mcp-session-id', data.params.sessionId);
        }
      } catch (e) {
        console.log(`Response is not JSON object, passing raw data: ${e}`);
        handleChatUpdate(event.data);
      }
    };
    
    // Handle errors
    eventSource.onerror = function(error) {
      console.warn("SSE connection error, running in offline mode:", error);
      handleChatUpdate("false");
    };
    
    return eventSource;
  } catch (error) {
    console.warn("Failed to create SSE connection:", error);
    return null;
  }
}

// Function to send messages to the server
export async function sendMessage(sessionId: string, message: string, handleChatUpdate: (data: string, done: boolean) => void) {
  try {
    const response = await fetch(`${SERVER_URL}/messages?sessionId=${sessionId}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ message })
    });
    
    if (!response.ok) {
      console.error(`HTTP error! status: ${response.status}`);
      handleChatUpdate(`Error: ${response.statusText}`, true);
      return;
    }
    
    const reader = response.body?.getReader();
    const decoder = new TextDecoder('utf-8');
    if (!reader) throw new Error('No response body reader available');

    let result = BLANK_STRING;
    while (true) {
      const { done, value } = await reader.read();
      if (done) break;
      result += decoder.decode(value, { stream: true });
      handleChatUpdate(result, done);
    }    // Chart description streaming logic
    if (isJsonObject(result)) {
      const chartData: ChartDataResponse = JSON.parse(result);
      if (SupportedChartTypes.includes(chartData?.type)) {
        chartData.analysis = chartData?.analysis ? `### Here is your requested chart & its observations\n\n---\n\n${chartData?.analysis}` : BLANK_STRING;
        const chunks: string[] = [];
        const chunkSize = 15;
        for (let i=0; i <chartData?.analysis?.length; i += chunkSize) {
          chunks.push(chartData?.analysis.substring(i, i + chunkSize));
        }
        let currentText = BLANK_STRING;
        chunks.forEach((chunk, index) => {
        const timeoutId = setTimeout(() => {
            currentText += chunk;
              const isLastChunk = index === chunks.length - 1;
              handleChatUpdate(JSON.stringify({...chartData, analysis: currentText}), isLastChunk);
              window.clearTimeout(timeoutId);
          }, index * 100); // Adjust delay as needed
        });
      }
    };

    handleChatUpdate(result, true);
  } catch (error) {
    console.warn("MCP server error, falling back to simulation:", error);
    throw error; // Re-throw to trigger fallback in ChatContainer
  }
};

export const isJsonObject = (str: string): boolean => {
  try {
    const parsed = JSON.parse(str);
    return typeof parsed === 'object' && parsed !== null;
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
  } catch (exception) {
    return false;
  }
};