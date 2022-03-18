export default function footerTemplate(): string {
  return `
<div class="wrapper footer-wrapper">
    <div class="info">
      <p class="copyright">©</p>
      <p class="year">2022</p>
      <div class="github-links">
        <a class="link" href="https://github.com/OlgaTolpykina" target="_blank">Olga Tolpykina</a>
      </div>
    </div>
    <a class="link rss-logo" href="https://rs.school/" target="_blank">
      <img src="./public/img/rss-logo.svg" alt="RSSchool" width="100" height="35" />
    </a>
</div>
`;
}