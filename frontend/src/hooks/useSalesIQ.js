import { useEffect } from 'react';

export function useSalesIQ() {
  useEffect(() => {
    const widgetKey = import.meta.env.VITE_ZOHO_SALESIQ_WIDGET_KEY;
    if (!widgetKey || widgetKey === 'placeholder' || widgetKey.includes('widget_key')) {
      console.log('[Zoho SalesIQ] Widget key not configured. Live chat is disabled.');
      return;
    }

    console.log('[Zoho SalesIQ] Initializing Live Chat widget...');
    
    // Configure global $zoho object
    window.$zoho = window.$zoho || {};
    window.$zoho.salesiq = window.$zoho.salesiq || {
      widgetcode: widgetKey,
      values: {},
      ready: function () {}
    };

    // Create and append the script
    const script = document.createElement('script');
    script.type = 'text/javascript';
    script.id = 'zsiqscript';
    script.defer = true;
    script.src = 'https://salesiq.zoho.com/widget';

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
