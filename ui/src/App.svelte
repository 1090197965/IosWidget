<script>
    import Router, { querystring, location, push } from 'svelte-spa-router';
    import { routes } from './route';
    import { NavBar, Icon } from 'stdf';
    import menuList from './data/menuList';

    // 循环 menuList，将所有元素的 childs 组成一个数组
    const menuListArr = menuList.reduce((acc, cur) => {
        if (cur.childs) {
            acc.push(...cur.childs);
        }
        return acc;
    }, []);
    console.log('menuListArr', menuListArr)

    const params = new URLSearchParams('?' + $querystring); //获取参数
    let theme = localStorage.getItem('theme') === 'dark' ? 'dark' : 'light';
    //截取字符?后面的所有字符
    let urlLang = window.location.href.split('?')[1];
    let urlParams = new URLSearchParams(urlLang);

    $: showLeft = $location !== '/';
    //手动切换主题
    const toggleFun = () => {
        if (theme === 'dark') {
            // 切换到light
            theme = 'light';
            localStorage.setItem('theme', 'light');
            document.documentElement.classList.remove('dark');
        } else {
            // 切换到dark
            theme = 'dark';
            localStorage.setItem('theme', 'dark');
            document.documentElement.classList.add('dark');
        }
    };
    const toHomeFun = () => {
        push(`/`);
    };
</script>

<main class="bg-gray9 dark:bg-gray5 text-black dark:text-white/90 relative min-h-screen text-justify w-screen antialiased">
    <div class="sticky z-10 top-0">
        <NavBar
            left={showLeft ? 'back' : ''}
            title={$location === '/'
                ? 'STDF 示例'
                : menuListArr.filter(item => item.nav === $location.substring(1))[0]['title_zh'] +
                  ('示例')}
            rightSlot
            on:clickleft={toHomeFun}
            injClass="bg-white/60 dark:bg-gray1/60 backdrop-blur"
        >
            <div slot="right" class="flex text-center">
                <!-- svelte-ignore a11y-click-events-have-key-events -->
                <div class="h-12 w-10 leading-10" on:click={toggleFun}>
                    <Icon name={theme === 'dark' ? 'ri-moon-fill' : 'ri-sun-line'} theme={true} />
                </div>
            </div>
        </NavBar>
    </div>
    <Router routes={routes} />
</main>
