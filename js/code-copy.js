// Add copy buttons to all code blocks
(function() {
  'use strict';

  // Wait for DOM to be fully loaded
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', addCopyButtons);
  } else {
    addCopyButtons();
  }

  function addCopyButtons() {
    // Find all code blocks
    var codeBlocks = document.querySelectorAll('.highlight > pre');
    
    codeBlocks.forEach(function(codeBlock) {
      // Skip if button already exists
      if (codeBlock.parentNode.querySelector('.copy-code-button')) {
        return;
      }

      // Create copy button
      var button = document.createElement('button');
      button.className = 'copy-code-button';
      button.textContent = 'Copy';
      button.setAttribute('aria-label', 'Copy code to clipboard');
      
      // Add click event
      button.addEventListener('click', function() {
        copyCode(codeBlock, button);
      });

      // Insert button into the highlight container
      codeBlock.parentNode.insertBefore(button, codeBlock);
    });
  }

  function copyCode(codeBlock, button) {
    // Get the code text
    var code = codeBlock.textContent || codeBlock.innerText;
    
    // Remove line numbers if they exist (they have class 'lineno')
    var lineNumbers = codeBlock.querySelectorAll('.lineno');
    if (lineNumbers.length > 0) {
      // Clone the code block to avoid modifying the original
      var tempBlock = codeBlock.cloneNode(true);
      var tempLineNumbers = tempBlock.querySelectorAll('.lineno');
      tempLineNumbers.forEach(function(ln) {
        ln.remove();
      });
      code = tempBlock.textContent || tempBlock.innerText;
    }

    // Clean up the code (trim extra whitespace)
    code = code.trim();

    // Use the Clipboard API if available
    if (navigator.clipboard && navigator.clipboard.writeText) {
      navigator.clipboard.writeText(code).then(function() {
        showCopiedFeedback(button);
      }).catch(function(err) {
        console.error('Failed to copy code: ', err);
        fallbackCopyCode(code, button);
      });
    } else {
      // Fallback for older browsers
      fallbackCopyCode(code, button);
    }
  }

  function fallbackCopyCode(code, button) {
    // Create a temporary textarea
    var textArea = document.createElement('textarea');
    textArea.value = code;
    textArea.style.position = 'fixed';
    textArea.style.top = '0';
    textArea.style.left = '0';
    textArea.style.width = '2em';
    textArea.style.height = '2em';
    textArea.style.padding = '0';
    textArea.style.border = 'none';
    textArea.style.outline = 'none';
    textArea.style.boxShadow = 'none';
    textArea.style.background = 'transparent';
    document.body.appendChild(textArea);
    textArea.focus();
    textArea.select();

    try {
      var successful = document.execCommand('copy');
      if (successful) {
        showCopiedFeedback(button);
      }
    } catch (err) {
      console.error('Fallback: Failed to copy code: ', err);
    }

    document.body.removeChild(textArea);
  }

  function showCopiedFeedback(button) {
    var originalText = button.textContent;
    button.textContent = 'Copied!';
    button.classList.add('copied');

    setTimeout(function() {
      button.textContent = originalText;
      button.classList.remove('copied');
    }, 2000);
  }
})();
