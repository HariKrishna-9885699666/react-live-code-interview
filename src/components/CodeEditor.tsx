import React, { useRef, useEffect } from 'react';
import Editor from '@monaco-editor/react';

interface User {
  id: string;
  name: string;
  color: string;
  isTyping: boolean;
  cursor?: { line: number; column: number };
}

interface CodeEditorProps {
  code: string;
  onChange: (value: string) => void;
  theme: 'light' | 'dark';
  users: User[];
  currentUser: User;
}

const CodeEditor: React.FC<CodeEditorProps> = ({ code, onChange, theme, users, currentUser }) => {
  const editorRef = useRef<any>(null);
  const decorationsRef = useRef<string[]>([]);

  const handleEditorDidMount = (editor: any, monaco: any) => {
    editorRef.current = editor;

    // Configure editor options
    editor.updateOptions({
      minimap: { enabled: true },
      fontSize: 14,
      lineHeight: 20,
      fontFamily: 'Monaco, Consolas, "Ubuntu Mono", monospace',
      wordWrap: 'on',
      automaticLayout: true,
      scrollBeyondLastLine: false,
      renderLineHighlight: 'gutter',
      selectOnLineNumbers: true,
      roundedSelection: false,
      readOnly: false,
      cursorStyle: 'line',
      cursorBlinking: 'blink',
      bracketPairColorization: { enabled: true },
      guides: {
        bracketPairs: 'active',
        bracketPairsHorizontal: true,
        highlightActiveBracketPair: true,
        indentation: true
      },
      suggest: {
        showKeywords: true,
        showSnippets: true,
        showFunctions: true,
        showVariables: true
      },
      quickSuggestions: {
        other: true,
        comments: false,
        strings: false
      }
    });

    // Add custom JavaScript snippets and completions
    monaco.languages.registerCompletionItemProvider('javascript', {
      provideCompletionItems: (model: any, position: any) => {
        const suggestions = [
          {
            label: 'console.log',
            kind: monaco.languages.CompletionItemKind.Snippet,
            insertText: 'console.log(${1:message});',
            insertTextRules: monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet,
            documentation: 'Log a message to the console'
          },
          {
            label: 'function',
            kind: monaco.languages.CompletionItemKind.Snippet,
            insertText: 'function ${1:functionName}(${2:parameters}) {\n\t${3:// code}\n\treturn ${4:result};\n}',
            insertTextRules: monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet,
            documentation: 'Create a function'
          },
          {
            label: 'for loop',
            kind: monaco.languages.CompletionItemKind.Snippet,
            insertText: 'for (let ${1:i} = 0; ${1:i} < ${2:array}.length; ${1:i}++) {\n\t${3:// code}\n}',
            insertTextRules: monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet,
            documentation: 'Create a for loop'
          },
          {
            label: 'if statement',
            kind: monaco.languages.CompletionItemKind.Snippet,
            insertText: 'if (${1:condition}) {\n\t${2:// code}\n}',
            insertTextRules: monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet,
            documentation: 'Create an if statement'
          },
          {
            label: 'try-catch',
            kind: monaco.languages.CompletionItemKind.Snippet,
            insertText: 'try {\n\t${1:// code that might throw}\n} catch (${2:error}) {\n\t${3:// handle error}\n}',
            insertTextRules: monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet,
            documentation: 'Create a try-catch block'
          }
        ];
        
        return { suggestions };
      }
    });

    // Set up cursor tracking
    editor.onDidChangeCursorPosition((e: any) => {
      // In a real implementation, this would send cursor position to other users
      const position = e.position;
      // console.log('Cursor moved to:', position.lineNumber, position.column);
    });

    // Format code on save
    editor.addCommand(monaco.KeyMod.CtrlCmd | monaco.KeyCode.KeyS, () => {
      editor.getAction('editor.action.formatDocument').run();
    });
  };

  // Update collaborative decorations
  useEffect(() => {
    if (!editorRef.current) return;

    const editor = editorRef.current;
    const otherUsers = users.filter(user => user.id !== currentUser.id);
    
    // Clear previous decorations
    if (decorationsRef.current) {
      decorationsRef.current = editor.deltaDecorations(decorationsRef.current, []);
    }

    // Add user cursor decorations (simulated)
    const newDecorations = otherUsers
      .filter(user => user.cursor)
      .map(user => ({
        range: new window.monaco.Range(
          user.cursor!.line, 
          user.cursor!.column, 
          user.cursor!.line, 
          user.cursor!.column
        ),
        options: {
          className: 'collaboration-cursor',
          stickiness: window.monaco.editor.TrackedRangeStickiness.NeverGrowsWhenTypingAtEdges,
          hoverMessage: { value: `${user.name}'s cursor` }
        }
      }));

    decorationsRef.current = editor.deltaDecorations([], newDecorations);
  }, [users, currentUser.id]);

  return (
    <div className="flex-1 relative">
      <Editor
        height="100%"
        language="javascript"
        theme={theme === 'dark' ? 'vs-dark' : 'vs-light'}
        value={code}
        onChange={(value) => onChange(value || '')}
        onMount={handleEditorDidMount}
        options={{
          selectOnLineNumbers: true,
          matchBrackets: 'always',
          autoClosingBrackets: 'always',
          autoClosingQuotes: 'always',
          autoSurround: 'languageDefined',
          autoIndent: 'full',
          contextmenu: true,
          fontFamily: 'Monaco, Consolas, "Ubuntu Mono", monospace',
          fontSize: 14,
          lineHeight: 20,
          minimap: {
            enabled: true,
            scale: 1
          },
          scrollbar: {
            useShadows: false,
            verticalHasArrows: true,
            horizontalHasArrows: true,
            vertical: 'visible',
            horizontal: 'visible'
          },
          overviewRulerLanes: 3,
          hideCursorInOverviewRuler: false,
          scrollBeyondLastLine: false,
          wordWrap: 'on',
          wrappingStrategy: 'advanced',
          renderLineHighlight: 'gutter',
          lineNumbers: 'on',
          glyphMargin: true,
          folding: true,
          foldingHighlight: true,
          foldingStrategy: 'auto',
          showFoldingControls: 'mouseover',
          unfoldOnClickAfterEndOfLine: false,
          guides: {
            bracketPairs: true,
            indentation: true,
            highlightActiveBracketPair: true
          }
        }}
      />
      
      {/* Typing Indicators */}
      <div className="absolute top-4 right-4 z-10">
        {users.filter(user => user.id !== currentUser.id && user.isTyping).map(user => (
          <div
            key={user.id}
            className="flex items-center space-x-2 bg-white dark:bg-gray-800 px-3 py-1 rounded-full shadow-lg border border-gray-200 dark:border-gray-600 mb-2"
            style={{ borderLeftColor: user.color, borderLeftWidth: '3px' }}
          >
            <span className="text-xs font-medium text-gray-700 dark:text-gray-300">
              {user.name} is typing
            </span>
            <div className="flex space-x-0.5">
              <div className="w-1.5 h-1.5 bg-blue-500 rounded-full pulse-dot"></div>
              <div className="w-1.5 h-1.5 bg-blue-500 rounded-full pulse-dot"></div>
              <div className="w-1.5 h-1.5 bg-blue-500 rounded-full pulse-dot"></div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default CodeEditor;