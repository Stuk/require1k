---
layout: default
---

<header>
<h1>require1k</h1>

<p class="view"><a href="http://github.com/orderedlist/minimal">View the Project on GitHub <small>Stuk/require1k</small></a></p>

<h2>Install</h2>

<p>Copy and paste:</p>
{% capture include %}{% include usage.md %}{% endcapture %}
{{ include | markdownify }}
</header>
<section>
{% capture include %}{% include_relative README.md %}{% endcapture %}
{{ include | markdownify }}
</section>
