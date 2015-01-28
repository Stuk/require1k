---
layout: default
---

<header>
<h1>require1k</h1>

<p class="view"><a href="http://github.com/Stuk/require1k">View the Project on GitHub <small>Stuk/require1k</small></a></p>

<h2>Install</h2>

<p>Copy and paste:</p>
{% capture include %}{% include usage.md %}{% endcapture %}
{{ include | markdownify }}

View the <a href="http://github.com/Stuk/require1k/blob/master/require1k.js">uncompressed version</a> on Github.

</header>
<section>
{% capture include %}{% include_relative README.md %}{% endcapture %}
{{ include | markdownify }}
</section>
