var ga_url = 'https://www.google-analytics.com/analytics.js';

if (process.env.NODE_ENV === "development") {
  ga_url = 'https://www.google-analytics.com/analytics_debug.js';
  // window.ga_debug = {trace: true};
}

(function(i,s,o,g,r,a,m){i['GoogleAnalyticsObject']=r;i[r]=i[r]||function(){
(i[r].q=i[r].q||[]).push(arguments)},i[r].l=1*new Date();a=s.createElement(o),
m=s.getElementsByTagName(o)[0];a.async=1;a.src=g;m.parentNode.insertBefore(a,m)
})(window,document,'script',ga_url,'ga');

ga('create', 'UA-99049706-5', 'auto');
ga('set', 'checkProtocolTask', null);
ga('send', 'pageview');
