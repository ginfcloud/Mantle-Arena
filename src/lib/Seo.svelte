<script>
  import { page } from '$app/stores';
  import { derived } from 'svelte/store';

  // Default values
  let defaultTitle = "Mantle Arena - PvP Game for any NFT, unleash unique skills from each NFT trait, and solo others for staked $MNT";
  let defaultKeyword = "Mantle, PvP, Gamefi, NFT, Mantle Network"
  let defaultDescription = "Mantle - PvP Game for any NFT, unleash unique skills from each NFT trait, and solo others for staked $MNT"
  // Base URL for your site
  const baseUrl = "https://marena.space";

  const url = derived(page, $page => `${baseUrl}${$page.url.pathname}`);

  export let title;
  export let description;
  export let keywords;
  $: {
    title = title || defaultTitle;
    description = description || defaultDescription;
    keywords  = keywords || defaultKeyword;
  }
</script>

<svelte:head>
  <link rel="canonical" href={$url} />

  <title>{title}</title>
  <meta name="title" content={title} />
  <meta name="description" content={description} />
</svelte:head>

