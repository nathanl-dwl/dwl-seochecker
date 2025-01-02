# **About the plugin**

Wonder SEO Checker is an Umbraco plugin that evaluates a website's SEO performance. It examines key aspects such as page load speed, title tags, meta descriptions, alt tags, and image formats. By analyzing these elements, valuable insights into the website's optimization for search engines can be gained.

This plugin is powered Google's Page Speed Insights API to perform the analysis. Lighthouse is an open-source, automated tool for improving the quality of web pages. It has audits for performance, accessibility, progressive web apps, SEO, and more.

**Version 1.4**

-Redundant loading of UUI elements has been removed, resolving a 404 error sometimes occuring for users
-Back-office error that displays on non-template pages has been removed
-New view implemented to notify users if they are attempting to load the plugin on a page without a template
-Check in place for local versions of websites, plugin only able to run on valid URLs
