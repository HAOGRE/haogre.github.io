<div class="copyright" >
  {% set current = date(Date.now(), "YYYY") %}
  &copy; {% if theme.since and theme.since != current %} {{ theme.since }} - {% endif %}
  <span itemprop="copyrightYear">{{ current }}</span>
  <span class="with-love">
    <i class="fa fa-{{ theme.authoricon }}" style="color:red"></i>
  </span>
  <span class="author" itemprop="copyrightHolder">{{ config.author }}</span><br/>
</div>

{% if theme.copyright %}
<div class="powered-by">
  {{ __('footer.powered', '<a class="theme-link" href="https://hexo.io" target="_blank">Hexo</a>') }}
</div>

<div class="theme-info">
  {{ __('footer.theme') }} -
  <a class="theme-link" href="https://github.com/iissnan/hexo-theme-next" target="_blank">
    NexT.{{ theme.scheme }}
  </a>
</div>
{% endif %}

<div class="copyright" >
  <span class="author" >不积跬步，无以至千里。不积小流，无以成江海。《劝学篇》</span>
</div>
