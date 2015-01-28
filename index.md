---
layout: default
---

<header>
<h1>require1k</h1>

<p class="view"><a href="http://github.com/Stuk/require1k">View the Project on GitHub <small>Stuk/require1k</small></a></p>

<h2>Install</h2>

<p>Copy and paste or <a href="http://github.com/Stuk/require1k/blob/master/require1k.min.js">download</a>:</p>
{% capture include %}{% include usage.md %}{% endcapture %}
{{ include | markdownify }}

<p>View the <a href="http://github.com/Stuk/require1k/blob/master/require1k.js">uncompressed version</a> on Github.</p>

<p><a href="https://news.ycombinator.com/item?id=8961403" class="hn-share-button">Vote/comment on HN</a></p>
<script src="//hnbutton.appspot.com/static/hn.min.js" async defer></script>

</header>
<section>
{% capture include %}{% include_relative README.md %}{% endcapture %}
{{ include | markdownify }}
</section>
