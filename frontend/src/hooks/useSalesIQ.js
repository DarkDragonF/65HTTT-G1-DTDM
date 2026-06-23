import { useEffect } from 'react';

export function useSalesIQ() {
  useEffect(() => {
    console.log('[Zoho SalesIQ] Initializing Live Chat widget...');
    
    // Configure global $zoho object
    window.$zoho = window.$zoho || {};
    window.$zoho.salesiq = window.$zoho.salesiq || {
      widgetcode: 'siq2cf01c2b27fc88b736770ee6819a43be195f9c5afa43f961ddba2a7e535b7605',
      values: {},
      ready: function () {}
    };

    // Create and append the script
    const script = document.createElement('script');
    script.type = 'text/javascript';
    script.id = 'zsiqscript';
    script.defer = true;
    script.src = 'https://salesiq.zohopublic.com/widget?wc=siq2cf01c2b27fc88b736770ee6819a43be195f9c5afa43f961ddba2a7e535b7605';

    const firstScript = document.getElementsByTagName('script')[0];
    if (firstScript && firstScript.parentNode) {
      firstScript.parentNode.insertBefore(script, firstScript);
    } else {
      document.body.appendChild(script);
    }

    return () => {
      // Cleanup on unmount (to avoid multiple script injections)
      const injectedScript = document.getElementById('zsiqscript');
      if (injectedScript && injectedScript.parentNode) {
        injectedScript.parentNode.removeChild(injectedScript);
      }
      // Remove the widget iframe if SalesIQ creates it
      const floatWidget = document.querySelector('.zsiq_float');
      if (floatWidget && floatWidget.parentNode) {
        floatWidget.parentNode.removeChild(floatWidget);
      }
    };
  }, []);
}
