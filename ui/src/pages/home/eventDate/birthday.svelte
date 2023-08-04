<script>
  import gsap from "gsap";
  import { onMount } from "svelte";
  import { setCache } from "../module/utils";

  let numFlakes = 50
  let width = window.innerWidth
  let height = window.innerHeight

  function createFlake() {
    let flake = document.createElement("div")
    let flakeClass = "flake flake" + gsap.utils.random(1,4,1)
    flake.setAttribute("class", flakeClass)
    document.body.appendChild(flake)
    return flake
  }

  function animateFlake(flake) {
    let scaleFactor = (Math.random()) //change to easeOut for more larger flakes
    let scale = gsap.utils.interpolate(0.3, 2, scaleFactor)
    let duration = gsap.utils.interpolate(2,4, 1-scaleFactor)
    let opacity = gsap.utils.interpolate(0.2, 0.6, scaleFactor)
    gsap.set(flake, {y:-200, x:gsap.utils.random(-200,width), scale:scale, opacity:opacity})
    gsap.to(flake, {y:height + 200, x:"+=200",
      duration:duration,
      delay:"random(0,4)",
      ease:"none",
      rotation:"random(-60, 200)",
      onComplete:animateFlake,
      onCompleteParams:[flake]})
  }

  const handleClick = (temporary = false) => {
    if (temporary) {
      window.EVENT_DATE_TEMPORARY_CLOSE = true;
    } else {
      setCache('EVENT_DATE_TEMPORARY_CLOSE', true);
    }
    history.go(-1);
  }

  onMount(() => {
    for(let i = 0; i < numFlakes; i++){
      let flake = createFlake()
      animateFlake(flake)
    }
  })
</script>

<div class="body">
  <div class="bday-card">
    <div class="bday-decor--container">
      <div class="bday-pic"><img src="./assets/eventDate/birthday/dangao.png"></div>
      <p class="bday-decor bday-decor--top-right float">🎈</p>
      <p class="bday-decor bday-decor--top-left spin">🌼</p></div>
    <h1 class="bday-banner"><span>Happy</span><span>Birthday</span></h1>
    <div class="bday-message bday-message--paper"><p>祝最最最最爱的宝贝生日快乐！！！ 祝宝贝事事顺利消费券一点就中刮刮乐张张中奖，大家身体健康，快快乐乐，给最爱的宝贝一个大波波，希望在未来的日子中我们能快乐度过每一天，让我们一起做大做强！共创辉煌！！<br>你滴臭猪</p>
      <p class="bday-decor bday-decor--bottom-right zoom-left-in-out">🎉</p></div>
  </div>
  <div class="button">
    <a href="javascript:;" on:click={() => handleClick(true)}>暂时关闭</a>
    <a href="javascript:;" on:click={() => handleClick()}>不再提示</a>
  </div>
</div>

<div>
  <style>
	  .flake {
		  position: fixed;
		  width: 60px;
		  height: 60px;
		  background-size: cover;
		  top: 0;
		  left: 0;
		  z-index: 1;
	  }

	  .flake1 {
		  background-image: url("./assets/eventDate/birthday.svg")
	  }

	  .flake2 {
		  background-image: url("./assets/eventDate/birthday.svg")
	  }

	  .flake3 {
		  background-image: url("./assets/eventDate/birthday.svg")
	  }

	  .flake4 {
		  background-image: url("./assets/eventDate/birthday.svg")
	  }
  </style>
</div>

<style>
	/* latin */
	@font-face {
		font-family: 'Shadows Into Light';
		font-style: normal;
		font-weight: 400;
		font-display: swap;
		src: url(./assets/eventDate/birthday/UqyNK9UOIntux_czAvDQx_ZcHqZXBNQzdcD5.woff2) format('woff2');
		unicode-range: U+0000-00FF, U+0131, U+0152-0153, U+02BB-02BC, U+02C6, U+02DA, U+02DC, U+0304, U+0308, U+0329, U+2000-206F, U+2074, U+20AC, U+2122, U+2191, U+2193, U+2212, U+2215, U+FEFF, U+FFFD;
	}

	/* latin-ext */
	@font-face {
		font-family: 'Abril Fatface';
		font-style: normal;
		font-weight: 400;
		font-display: swap;
		src: url(./assets/eventDate/birthday/zOL64pLDlL1D99S8g8PtiKchq-lmjdLh.woff2) format('woff2');
		unicode-range: U+0100-02AF, U+0304, U+0308, U+0329, U+1E00-1E9F, U+1EF2-1EFF, U+2020, U+20A0-20AB, U+20AD-20CF, U+2113, U+2C60-2C7F, U+A720-A7FF;
	}

	/* latin */
	@font-face {
		font-family: 'Abril Fatface';
		font-style: normal;
		font-weight: 400;
		font-display: swap;
		src: url(./assets/eventDate/birthday/zOL64pLDlL1D99S8g8PtiKchq-dmjQ.woff2) format('woff2');
		unicode-range: U+0000-00FF, U+0131, U+0152-0153, U+02BB-02BC, U+02C6, U+02DA, U+02DC, U+0304, U+0308, U+0329, U+2000-206F, U+2074, U+20AC, U+2122, U+2191, U+2193, U+2212, U+2215, U+FEFF, U+FFFD;
	}

	html, body, div, span, applet, object, iframe, h1, h2, h3, h4, h5, h6, p, blockquote, pre, a, abbr, acronym, address, big, cite, code, del, dfn, em, img, ins, kbd, q, s, samp, small, strike, strong, sub, sup, tt, var, b, u, i, center, dl, dt, dd, ol, ul, li, fieldset, form, label, legend, table, caption, tbody, tfoot, thead, tr, th, td, article, aside, canvas, details, embed, figure, figcaption, footer, header, hgroup, menu, nav, output, ruby, section, summary, time, mark, audio, video {
		margin: 0;
		padding: 0;
		border: 0;
		font-size: 100%;
		font: inherit;
		vertical-align: baseline
	}

	article, aside, details, figcaption, figure, footer, header, hgroup, menu, nav, section {
		display: block
	}

	.body {
		line-height: 1
	}

	ol, ul {
		list-style: none
	}

	blockquote, q {
		quotes: none
	}

	blockquote:before, blockquote:after, q:before, q:after {
		content: '';
		content: none
	}

	table {
		border-collapse: collapse;
		border-spacing: 0
	}

	:root {
		--background: #f3d7e6;
		--background-decor: #dbc0d7;
		--banner-bg: #1C0C5B;
		--banner-txt: white;
		--message-bg: #f1e9f0;
		--message-line: #94ACD4;
		--message-txt: #333;
		--font-banner: 'Abril Fatface', cursive;
		--font-text: 'Shadows Into Light', cursive;
		--space: 16px;
		--space-xsm: 4px;
		--space-sm: 8px;
		--space-lg: 24px;
		--space-xlg: 48px
	}

	.body {
		min-height: 100vh;
		width: 100vw;
		display: flex;
		justify-content: center;
		overflow-x: hidden;
		background-color: var(--background);
		background-image: radial-gradient(var(--background-decor) 20%, transparent 0), radial-gradient(var(--background-decor) 20%, transparent 0);
		background-size: 30px 30px;
		background-position: 0 0, 15px 15px
	}

	.bday-card {
		max-width: 420px;
		height: 100%;
		padding-top: var(--space-lg);
		display: flex;
		align-items: center;
		justify-content: center;
		flex-direction: column;
		position: relative
	}

	.bday-pic {
		display: flex;
		align-items: center;
		justify-content: center;
		width: 280px;
		/*height: 240px;*/
		padding: var(--space-sm);
		background: white;
		border-radius: 4px;
		box-shadow: var(--space-xsm) var(--space-xsm) 15px rgba(0, 0, 0, .15);
		transform: rotate(5deg) translate(20px, 45px)
	}

	.bday-pic img {
		width: 100%;
		height: 100%;
		object-fit: cover
	}

	.bday-decor--container {
		position: relative
	}

	.bday-banner {
		display: flex;
		flex-direction: column;
		align-items: baseline;
		font-size: 42px;
		z-index: 1;
		color: var(--banner-txt);
		font-family: var(--font-banner);
		text-transform: uppercase;
		transform: rotate(-5deg);
		gap: var(--space-sm) 0
	}

	.bday-banner span {
		background: var(--banner-bg);
		padding: var(--space) var(--space-lg);
		flex-grow: 0
	}

	.bday-banner span:nth-child(2) {
		margin-left: var(--space-lg)
	}

	.bday-message {
		max-width: 80%;
		padding: 35px var(--space);
		font-family: var(--font-text);
		font-size: 14px;
		line-height: 24px;
		color: var(--message-txt);
		background-color: var(--message-bg)
	}

	.bday-message--paper {
		background: repeating-linear-gradient(var(--message-bg), var(--message-bg) 24px, var(--message-line) 24px, var(--message-line) 25px);
		box-shadow: var(--space-xsm) var(--space-xsm) 15px rgba(0, 0, 0, .15)
	}

	.bday-message--block-right {
		position: relative
	}

	.bday-message--block-right::before {
		content: "";
		width: 100vw;
		height: 100%;
		position: absolute;
		right: 0;
		top: 0;
		bottom: 0;
		background: var(--paper);
		z-index: -1
	}

	.bday-message--block-left {
		position: relative
	}

	.bday-message--block-left::before {
		content: "";
		width: 100vw;
		height: 100%;
		position: absolute;
		left: 0;
		top: 0;
		bottom: 0;
		background: var(--paper);
		z-index: -1
	}

	.bday-decor {
		font-size: 96px
	}

	.bday-decor--top-right {
		position: absolute;
		bottom: -70px;
		right: -20px
	}

	.bday-decor--top-left {
		position: absolute;
		bottom: 0;
		left: -25px
	}

	.bday-decor--bottom-right {
		position: absolute;
		right: 20px
	}

	.zoom-left-in-out {
		animation-name: zoom-left-in-out;
		animation-duration: 1.75s;
		animation-iteration-count: infinite;
		transform-origin: left bottom
	}

	@keyframes zoom-left-in-out {
		0%, 100% {
			transform: scale(0.95) rotate(2deg)
		}
		50% {
			transform: scale(1) rotate(-2deg)
		}
	}

	.pulse {
		animation-name: pulse;
		animation-duration: 1.3s;
		animation-iteration-count: infinite
	}

	@keyframes pulse {
		0%, 100% {
			transform: scale(0.9)
		}
		50% {
			transform: scale(1)
		}
	}

	.float {
		animation-name: float;
		animation-duration: 1.9s;
		animation-iteration-count: infinite
	}

	@keyframes float {
		0%, 100% {
			transform: translateY(0px)
		}
		50% {
			transform: translateY(10px)
		}
	}

	.spin {
		animation-name: spin;
		animation-duration: 3s;
		animation-iteration-count: infinite;
		animation-timing-function: linear
	}

	@keyframes spin {
		from {
			transform: rotate(0)
		}
		to {
			transform: rotate(360deg)
		}
	}

  .button {
    position: fixed;
    bottom: 5%;
	  font-size: 16px;
  }

  .button a {
	  color: #7288e1;
    font-weight: bold;
	  font-size: 22px;
    margin: 0 15px;
  }
</style>
