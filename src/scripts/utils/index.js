// Tambahkan fungsi ini di bawah export lainnya
export function setupSkipToContent(skipLink, contentElement) {
  if (!skipLink || !contentElement) return;

  skipLink.addEventListener('click', function (event) {
    event.preventDefault(); 
    skipLink.blur();        

    contentElement.setAttribute('tabindex', '-1'); 
    contentElement.focus();                        
    contentElement.scrollIntoView();               
  });
}
