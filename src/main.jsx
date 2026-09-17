import { useEffect, useMemo, useRef, useState } from "react";
import { createRoot } from "react-dom/client";
import { getProduct, products } from "./data/products";
import { MotionLayer } from "./motion";
import { trapDialogFocus } from "./dialog";
import ProductGallery from "./Gallery";
import { galleryImages, imagePreview, cardImage } from "./media";
import "./styles.css";
import "./premium.css";

const WHATSAPP_NUMBER = "917702426007";
const LOGO = "/assets/brand/elite-kidz-logo.jpg";

function Icon({ name, size = 20 }) {
  const common = { width: size, height: size, viewBox: "0 0 24 24", fill: "none", stroke: "currentColor", strokeWidth: 1.7, strokeLinecap: "round", strokeLinejoin: "round", "aria-hidden": "true" };
  const paths = {
    search: <><circle cx="11" cy="11" r="6.5" /><path d="m16 16 4.5 4.5" /></>,
    bag: <><path d="M5.5 8.5h13l.8 11H4.7l.8-11Z" /><path d="M8.5 8.5V6a3.5 3.5 0 0 1 7 0v2.5" /></>,
    arrow: <><path d="M5 12h13" /><path d="m13 6 6 6-6 6" /></>,
    plus: <><path d="M12 5v14" /><path d="M5 12h14" /></>,
    minus: <path d="M5 12h14" />,
    close: <><path d="m6 6 12 12" /><path d="m18 6-12 12" /></>,
    chevron: <path d="m6 9 6 6 6-6" />,
    whatsapp: <><path d="M20.2 11.5a8.2 8.2 0 0 1-12.3 7L4 20l1.5-3.7a8.2 8.2 0 1 1 14.7-4.8Z" /><path d="M8.2 8.2c.2-.4.4-.4.7-.4h.5c.2 0 .4.1.5.4l.7 1.7c.1.3.1.5-.1.7l-.5.6c.6 1.1 1.5 1.9 2.7 2.5l.5-.6c.2-.2.4-.2.7-.1l1.7.8c.3.1.4.3.3.6-.2.9-.9 1.4-1.6 1.4-2.2-.1-5.6-2.9-6.4-5.8-.2-.7 0-1.4.3-1.8Z" /></>,
    phone: <><path d="M7.1 4.5 9.2 4a1 1 0 0 1 1.1.6l1 2.5a1 1 0 0 1-.3 1.1l-1.2 1a12.5 12.5 0 0 0 5 5l1-1.2a1 1 0 0 1 1.1-.3l2.5 1a1 1 0 0 1 .6 1.1l-.5 2.1a1.5 1.5 0 0 1-1.5 1.2C11 18 6 13 4.8 6a1.5 1.5 0 0 1 1.2-1.5Z" /></>,
    mail: <><rect x="3.5" y="5.5" width="17" height="13" rx="1.5" /><path d="m4 7 8 6 8-6" /></>,
    menu: <><path d="M4 7h16" /><path d="M4 12h16" /><path d="M4 17h16" /></>,
    sparkle: <><path d="m12 3 1.5 6.5L20 11l-6.5 1.5L12 19l-1.5-6.5L4 11l6.5-1.5L12 3Z" /><path d="m19 3 .5 2 1.5.5-1.5.5-.5 2-.5-2L17 5.5l1.5-.5.5-2Z" /></>,
    zoom: <><circle cx="10.8" cy="10.8" r="5.8" /><path d="m15.2 15.2 4.4 4.4" /><path d="M8.4 10.8h4.8" /><path d="M10.8 8.4v4.8" /></>,
  };
  return <svg {...common}>{paths[name]}</svg>;
}

function useHashRoute() {
  const getRoute = () => {
    const raw = window.location.hash.replace(/^#\/?/, "") || "home";
    const [path, query = ""] = raw.split("?");
    const segments = path.split("/").filter(Boolean);
    return { page: segments[0] || "home", slug: segments[1], query: new URLSearchParams(query) };
  };
  const [route, setRoute] = useState(getRoute);
  useEffect(() => {
    const handler = () => setRoute(getRoute());
    window.addEventListener("hashchange", handler);
    return () => window.removeEventListener("hashchange", handler);
  }, []);
  return route;
}

function navigate(path) {
  window.location.hash = path.startsWith("#") ? path : `#/${path}`;
  window.scrollTo({ top: 0, behavior: "smooth" });
}

function handleInternalNavigation(event, path, afterNavigate) {
  if (event.defaultPrevented || event.button !== 0 || event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return;
  event.preventDefault();
  afterNavigate?.();
  navigate(path);
}

function createWhatsAppUrl(items, directProduct, directSize, directQuantity) {
  const list = directProduct ? [{ product: directProduct, quantity: directQuantity || 1, size: directSize || "To confirm on WhatsApp" }] : items;
  const lines = ["Hi Elite Kidz 👋", "", "I'd like to enquire about:", ""];
  list.forEach((item, index) => {
    lines.push(`${index + 1}. ${item.product.name}`);
    if (item.product.itemNumber) lines.push(`Style: ${item.product.itemNumber}`);
    lines.push(`Size: ${item.size || "To confirm on WhatsApp"}`);
    lines.push(`Qty: ${item.quantity}`);
    lines.push("");
  });
  lines.push("Please confirm size availability and order details.");
  return `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(lines.join("\n"))}`;
}

function Header({ cartCount, onOpenCart, onOpenSearch }) {
  const [menuOpen, setMenuOpen] = useState(false);
  useEffect(() => { if(!menuOpen) return; const old=document.body.style.overflow; document.body.style.overflow='hidden'; const close=e=>{if(e.key==='Escape')setMenuOpen(false);}; const resize=()=>{if(innerWidth>820)setMenuOpen(false);}; window.addEventListener('keydown',close);window.addEventListener('resize',resize); return ()=>{document.body.style.overflow=old;window.removeEventListener('keydown',close);window.removeEventListener('resize',resize);}; },[menuOpen]);
  return <>
    <div className="announcement"><span>WhatsApp ordering</span><span className="announcement-dot">·</span><span>New Mallepally, Hyderabad</span><a href={`https://wa.me/${WHATSAPP_NUMBER}`} target="_blank" rel="noreferrer">Chat with us <Icon name="arrow" size={14} /></a></div>
    <header className="site-header" onKeyDown={menuOpen ? trapDialogFocus : undefined}>
      <button className="mobile-menu" aria-label={menuOpen ? "Close menu" : "Open menu"} aria-expanded={menuOpen} onClick={() => setMenuOpen((open) => !open)}><Icon name={menuOpen ? "close" : "menu"} /></button>
      <a className="brand-lockup" href="#/" onClick={(event) => handleInternalNavigation(event, "", () => setMenuOpen(false))} aria-label="Elite Kidz home">
        <img src={LOGO} alt="Elite Kidz — Stylish, Comfy, Made for Little Stars" />
      </a>
      <nav className={`main-nav ${menuOpen ? "is-open" : ""}`} aria-label="Primary navigation">
        <a href="#/shop" onClick={(event) => handleInternalNavigation(event, "shop", () => setMenuOpen(false))}>Shop</a>
        <a href="#/shop?type=Dress" onClick={(event) => handleInternalNavigation(event, "shop?type=Dress", () => setMenuOpen(false))}>Dresses</a>
        <a href="#/about" onClick={(event) => handleInternalNavigation(event, "about", () => setMenuOpen(false))}>About</a>
        <a href="#/contact" onClick={(event) => handleInternalNavigation(event, "contact", () => setMenuOpen(false))}>Contact</a>
        <a href="#/faq" onClick={(event) => handleInternalNavigation(event, "faq", () => setMenuOpen(false))}>FAQ</a>
      </nav>
      <div className="header-actions">
        <button className="icon-button" aria-label="Search products" onClick={() => { setMenuOpen(false); onOpenSearch(); }}><Icon name="search" /></button>
        <button className="bag-button" aria-label={`Open bag${cartCount ? `, ${cartCount} item${cartCount === 1 ? "" : "s"}` : ""}`} onClick={() => { setMenuOpen(false); onOpenCart(); }}><Icon name="bag" /><span className="bag-count" aria-live="polite">{cartCount}</span></button>
      </div>
    </header>
  </>;
}

function Footer() {
  return <footer className="site-footer">
    <div className="footer-wordmark" aria-hidden="true">Little stars. Big love.</div><div className="footer-brand">
      <img src={LOGO} alt="Elite Kidz" />
      <p>Stylish <span>•</span> Comfy<br />Made for little stars</p>
    </div>
    <div className="footer-links">
      <div><p className="footer-heading">Explore</p><a href="#/shop">Shop all</a><a href="#/size-guide">Size guide</a><a href="#/faq">FAQ</a></div>
      <div><p className="footer-heading">Elite Kidz</p><a href="#/about">About us</a><a href="#/contact">Contact</a><a href="#/shipping-returns">Shipping &amp; returns</a><a href={`https://wa.me/${WHATSAPP_NUMBER}`} target="_blank" rel="noreferrer">WhatsApp ordering</a></div>
      <div><p className="footer-heading">Visit</p><p>11-3-178/2<br />New Mallepally<br />Hyderabad</p><a href="mailto:elitekidss@outlook.com">elitekidss@outlook.com</a><a href="tel:+917702426007">7702426007</a></div>
    </div>
    <div className="footer-bottom"><span>© {new Date().getFullYear()} Elite Kidz</span><span>Made for little stars</span></div>
  </footer>;
}

function SectionHeading({ eyebrow, title, action, onAction }) {
  return <div className="section-heading"><div>{eyebrow && <p className="eyebrow">{eyebrow}</p>}<h2>{title}</h2></div>{action && <button className="text-link" onClick={onAction}>{action} <Icon name="arrow" size={16} /></button>}</div>;
}

function ProductCard({ product, onQuickAsk, onAdd }) {
  const [quickOpen, setQuickOpen] = useState(false);
  const primary = cardImage(product);
  return <article className="product-card">
    <div className="card-photo">
      <a className="product-image-wrap" href={`#/product/${product.slug}`} aria-label={`View ${product.name}`}>
        <img src={imagePreview(primary)} srcSet={`${imagePreview(primary)} 480w, ${imagePreview(primary,960)} 960w`} sizes="(max-width: 700px) 48vw, 30vw" alt={product.alt} loading="lazy" />
        {product.status === 'New arrival' && <span className="product-badge">New arrival</span>}
      </a>
      <button className="quick-add" onClick={() => setQuickOpen(v => !v)} aria-expanded={quickOpen} aria-label={`Quick add ${product.name}`}>{quickOpen ? 'Close' : 'Quick add'} <Icon name={quickOpen ? 'close' : 'plus'} size={16} /></button>
      {quickOpen && <div className="quick-sizes"><p>Choose a size <span>Stock confirmed on WhatsApp</span></p><div>{product.sizes.map(size => <button key={size} onClick={() => { onAdd(product,1,size); setQuickOpen(false); }}>{size}</button>)}</div></div>}
    </div>
    <div className="product-meta"><div><p className="product-collection">{product.type} <span>{product.itemNumber}</span></p><h3><a href={`#/product/${product.slug}`}>{product.name}</a></h3><p className="product-colour">{product.colour}</p><p className="price-enquiry">Price on enquiry</p></div><button className="mini-whatsapp" aria-label={`Ask about ${product.name} on WhatsApp`} onClick={() => onQuickAsk(product)}><Icon name="whatsapp" size={18} /></button></div>
  </article>;
}

function Home({ onQuickAsk, onAdd }) {
  const hero = products.find(p => p.slug === 'ivory-tulip-dress-x5014');
  const types = [...new Set(products.map(p => p.type))];
  const featureProducts = products.filter(p=>p.featured);
  return <main id="main-content">
    <section className="fashion-hero">
      <div className="fashion-hero-inner section-shell">
        <div className="fashion-hero-copy"><p className="hero-kicker">Elite Kidz · Kidswear, with character</p><h1>Made for<br /><em>little</em> stars<span className="hero-star" aria-hidden="true">✳</span></h1><p>Floral collars. Playful colours.<br />A little personality in every piece.</p><a className="button button-dark" href="#/shop">Explore the collection <Icon name="arrow" size={18} /></a><div className="hero-footnote"><span>Stylish. Comfy. So very them.</span><span>Hyderabad, India</span></div></div>
        <div className="fashion-hero-images"><a className="hero-main-photo" href={`#/product/${hero.slug}`}><img src={imagePreview(cardImage(hero),960)} alt={hero.alt} fetchPriority="high" /><span>Ivory Tulip Dress <Icon name="arrow" size={18} /></span></a><a className="hero-detail-photo" href={`#/product/${products[12].slug}`}><img src={imagePreview(cardImage(products[12]))} alt={products[12].alt} /><span>A little green, a lot of joy ↗</span></a><span className="hero-image-note" aria-hidden="true">THE LITTLE THINGS</span></div>
      </div>
    </section>
    <div className="collection-nav section-shell"><span>Find their favourite</span>{types.map(type=><a key={type} href={`#/shop?type=${type}`}>{type === 'Dress' ? 'Dresses' : type === 'Top' ? 'Tops' : type} <Icon name="arrow" size={14}/></a>)}</div>
    <section className="section-shell products-section home-products"><SectionHeading title="Little wardrobe, big favourites." action={`Explore all ${products.length} pieces`} onAction={() => navigate('shop')} /><div className="product-grid">{featureProducts.map(product=><ProductCard key={product.id} product={product} onAdd={onAdd} onQuickAsk={onQuickAsk}/>)}</div></section>
    <section className="detail-story section-shell"><a className="story-main-image" href="#/product/ivory-floral-collar-dress-x5671"><img src={imagePreview('/assets/products/red-ivory/source/source-56.jpg',960)} alt="Ivory Floral Collar Dress, worn with its embroidered collar visible" loading="lazy" /></a><div className="detail-story-copy"><span className="story-label">A closer look</span><h2>It’s all in<br />the <em>little details.</em></h2><p>A floral collar. A flutter sleeve. Explore the Ivory Floral Collar Dress, right down to the embroidery.</p><a className="text-link" href="#/product/ivory-floral-collar-dress-x5671">Meet the dress <Icon name="arrow" size={18}/></a><a className="story-detail-image" href="#/product/ivory-floral-collar-dress-x5671"><img src={imagePreview('/assets/products/red-ivory/source/source-69.jpg')} alt="Close-up of the real embroidered floral collar" loading="lazy"/><span>Take a closer look ↗</span></a></div></section>
    <section className="section-shell new-pieces"><SectionHeading title="More to fall for." action="Shop the edit" onAction={()=>navigate('shop')}/><div className="product-grid">{products.filter(p=>['sage-babydoll-blouse-lx0063','ivory-tulip-pants-x5013','pink-floral-collar-dress-x5008','pink-ruffle-bib-dress-x5009'].includes(p.slug)).map(product=><ProductCard key={product.id} product={product} onAdd={onAdd} onQuickAsk={onQuickAsk}/>)}</div></section>
    <section className="personal-shopping section-shell"><span className="personal-star" aria-hidden="true">✳</span><div><h2>A little help.<br /><em>A lovely find.</em></h2><p>Questions about a size or a favourite piece? Talk to Elite Kidz for prices, availability and personal ordering.</p><a className="button button-dark" href={`https://wa.me/${WHATSAPP_NUMBER}`} target="_blank" rel="noreferrer"><Icon name="whatsapp" size={18}/> Let’s chat</a></div><p className="personal-signature">For little stars.<br />And the people<br />who dress them.</p></section>
  </main>;
}

function SearchBar({ value, onChange, onClose }) {
  const dialog = useRef(null);
  useEffect(()=>{ dialog.current.showModal(); const old=document.body.style.overflow; document.body.style.overflow='hidden'; return ()=>{dialog.current?.close();document.body.style.overflow=old;}; },[]);
  const query=value.trim().toLowerCase();
  const found=products.filter(p=>[p.name,p.colour,p.itemNumber,p.type,...p.tags].join(' ').toLowerCase().includes(query));
  return <dialog onKeyDown={trapDialogFocus} ref={dialog} className="search-dialog" onCancel={onClose} aria-label="Search products"><div className="search-dialog-header"><span>Find a little favourite</span><button className="icon-button" onClick={onClose} aria-label="Close search"><Icon name="close"/></button></div><div className="search-field"><Icon name="search" size={24}/><input autoFocus value={value} onChange={e=>onChange(e.target.value)} placeholder="A dress, a colour, a style…" aria-label="Search the collection"/></div><p className="search-summary">{query ? `${found.length} matching ${found.length === 1 ? 'piece' : 'pieces'}` : `Explore all ${products.length} pieces`}</p><div className="search-results">{found.map(p=><a key={p.id} href={`#/product/${p.slug}`} onClick={onClose}><img src={imagePreview(cardImage(p),160)} alt={p.alt}/><span><strong>{p.name}</strong><small>{p.colour} · {p.itemNumber}</small><small>Price on enquiry</small></span><Icon name="arrow" size={18}/></a>)}</div>{!found.length && <div className="empty-results"><h2>No little matches yet.</h2><p>Try “dress”, “ivory” or a style code.</p><button className="button button-outline" onClick={()=>onChange('')}>Clear search</button></div>}</dialog>;
}

function Filters({ activeType, setActiveType, activeSize, setActiveSize, activeColour, setActiveColour }) {
  const typeNames=[...new Set(products.map(p=>p.type))];
  const sizes=[...new Set(products.flatMap(p=>p.sizes))];
  const colours=[...new Set(products.map(p=>p.colour))];
  return <div className="catalog-filters"><div className="type-tabs" aria-label="Product type"><button className={!activeType?'active':''} aria-pressed={!activeType} onClick={()=>setActiveType('')}>All pieces</button>{typeNames.map(type=><button key={type} className={activeType===type?'active':''} aria-pressed={activeType===type} onClick={()=>setActiveType(type)}>{type==='Dress'?'Dresses':type==='Top'?'Tops':type}</button>)}</div><div className="filter-selects"><label>Size <select aria-label="Filter by size" value={activeSize} onChange={e=>setActiveSize(e.target.value)}><option value="">All sizes</option>{sizes.map(size=><option key={size}>{size}</option>)}</select></label><label>Colour <select aria-label="Filter by colour" value={activeColour} onChange={e=>setActiveColour(e.target.value)}><option value="">All colours</option>{colours.map(colour=><option key={colour}>{colour}</option>)}</select></label></div></div>;
}

function Shop({ route, onQuickAsk, onAdd }) {
  const [search,setSearch]=useState(route.query.get('search')||'');
  const [activeType,setActiveType]=useState(route.query.get('type')||'');
  const [activeSize,setActiveSize]=useState('');
  const [activeColour,setActiveColour]=useState('');
  const [sort,setSort]=useState('featured');
  const filtered=useMemo(()=>{
    const query=search.trim().toLowerCase();
    const result=products.filter(p=>(!query || [p.name,p.colour,p.itemNumber,p.type,...p.tags].join(' ').toLowerCase().includes(query)) && (!activeType || p.type===activeType) && (!activeSize || p.sizes.includes(activeSize)) && (!activeColour || p.colour===activeColour));
    return sort==='alphabetical' ? result.sort((a,b)=>a.name.localeCompare(b.name)) : result.sort((a,b)=>Number(!!b.featured)-Number(!!a.featured));
  },[search,activeType,activeSize,activeColour,sort]);
  const clear=()=>{setSearch('');setActiveType('');setActiveSize('');setActiveColour('');};
  return <main id="main-content" className="shop-page section-shell"><div className="shop-intro"><div><p className="eyebrow">The Elite Kidz wardrobe</p><h1>Small clothes.<br /><em>Big personality.</em></h1></div><p>Find their next favourite. Explore our kidswear, choose a size, and order personally with Elite Kidz on WhatsApp.</p></div><div className="shop-toolbar"><div className="shop-search"><Icon name="search" size={19}/><input value={search} onChange={e=>setSearch(e.target.value)} placeholder="Search pieces or style code" aria-label="Search pieces"/></div><label className="sort-select">Sort by <select value={sort} onChange={e=>setSort(e.target.value)}><option value="featured">Featured</option><option value="alphabetical">A–Z</option></select><Icon name="chevron" size={15}/></label></div><Filters {...{activeType,setActiveType,activeSize,setActiveSize,activeColour,setActiveColour}}/><div className="catalog-count"><span>{filtered.length} {filtered.length===1?'piece':'pieces'} · Prices & availability on enquiry</span>{(search||activeType||activeSize||activeColour)&&<button onClick={clear}>Clear filters ×</button>}</div>{filtered.length?<div className="product-grid shop-grid">{filtered.map(product=><ProductCard key={product.id} product={product} onAdd={onAdd} onQuickAsk={onQuickAsk}/>)}</div>:<div className="empty-results"><Icon name="search" size={28}/><h2>Nothing matched that search.</h2><p>Try another colour, size or style code.</p><button className="button button-dark" onClick={clear}>Clear filters</button></div>}</main>;
}

function ProductPage({ product, onAdd, onQuickAsk }) {
  const [quantity,setQuantity]=useState(1);
  const [selectedSize,setSelectedSize]=useState('');
  if(!product) return <NotFound/>;
  return <main id="main-content" className="product-page section-shell"><nav className="breadcrumbs" aria-label="Breadcrumb"><a href="#/shop">The collection</a><span>/</span><a href={`#/shop?type=${product.type}`}>{product.type}</a><span>/</span><span>{product.name}</span></nav><div className="product-layout"><ProductGallery product={product}/><div className="product-info"><p className="eyebrow">{product.category} · {product.type} · {product.itemNumber}</p><h1>{product.name}</h1><p className="pdp-price">Price on enquiry</p>{product.description&&<p className="product-lede">{product.description}</p>}<div className="product-rule"/><p className="product-colour-label"><span>Colour</span> {product.colour}</p><div className="size-block"><div className="option-label"><span>Select a size</span><a href={product.sizeChart||'#/size-guide'} target={product.sizeChart?'_blank':undefined} rel="noreferrer">Size guide ↗</a></div><div className="size-options" role="group" aria-label={`Choose a size for ${product.name}`}>{product.sizes.map(size=><button key={size} className={selectedSize===size?'active':''} aria-pressed={selectedSize===size} onClick={()=>setSelectedSize(size)}>{size}</button>)}</div><p className="stock-note">Size availability confirmed on WhatsApp.</p></div><div className="quantity-block"><span className="option-label">Quantity</span><div className="quantity-control"><button disabled={quantity===1} aria-label="Decrease quantity" onClick={()=>setQuantity(q=>Math.max(1,q-1))}><Icon name="minus" size={16}/></button><span aria-live="polite">{quantity}</span><button aria-label="Increase quantity" onClick={()=>setQuantity(q=>q+1)}><Icon name="plus" size={16}/></button></div></div><div className="product-actions"><button className="button button-dark button-wide" disabled={!selectedSize} onClick={()=>onAdd(product,quantity,selectedSize)}><Icon name="bag" size={18}/>{selectedSize?'Add to bag':'Select a size to add'}</button><button className="button button-outline button-wide" onClick={()=>onQuickAsk(product,selectedSize,quantity)}><Icon name="whatsapp" size={18}/> Ask about this piece</button></div><p className="action-note">Your bag is an enquiry. We’ll confirm price, availability and delivery before you order.</p><div className="pdp-details">{product.detail&&<details><summary>About this piece <Icon name="plus" size={16}/></summary><p>Style {product.itemNumber}. {product.description || `${product.type} in ${product.colour.toLowerCase()}.`}</p></details>}{product.material&&<details><summary>Material <Icon name="plus" size={16}/></summary><p>{product.material}</p></details>}<details><summary>Ordering & delivery <Icon name="plus" size={16}/></summary><p>Choose your size and add your favourites to the bag. Continue on WhatsApp to confirm prices, stock and delivery with Elite Kidz.</p><a href="#/shipping-returns">Ordering information ↗</a></details></div></div></div><section className="related-products"><SectionHeading title="A few more little favourites" action="Explore the collection" onAction={()=>navigate('shop')}/><div className="product-grid">{products.filter(p=>p.id!==product.id).slice(0,4).map(p=><ProductCard key={p.id} product={p} onAdd={onAdd} onQuickAsk={onQuickAsk}/>)}</div></section></main>;
}

function About() {
  return <main id="main-content" className="content-page section-shell"><div className="page-intro narrow"><p className="eyebrow">About Elite Kidz</p><h1>Made for little stars,<br /><em>with room to be themselves.</em></h1><p>Elite Kidz is a kids fashion label in Hyderabad focused on stylish, comfy pieces for children.</p></div><div className="about-grid"><div className="about-image"><img src={products[12].images[0]} alt="Sage green dress from the Elite Kidz collection" /></div><div className="about-copy"><p className="eyebrow">The point of view</p><h2>Style should feel as good as it looks.</h2><p>Our current collection brings together soft colour stories, considered details and easy silhouettes for little ones.</p><p>For prices, current size availability and order guidance, Elite Kidz is just a WhatsApp message away.</p><a className="button button-dark" href={`https://wa.me/${WHATSAPP_NUMBER}`} target="_blank" rel="noreferrer"><Icon name="whatsapp" size={18} /> Talk to Elite Kidz</a></div></div></main>;
}

function Contact() {
  return <main id="main-content" className="content-page section-shell"><div className="page-intro narrow"><p className="eyebrow">Contact</p><h1>Let’s find the<br /><em>right little look.</em></h1><p>Browse the collection, then reach us directly for size availability and order guidance.</p></div><div className="contact-grid"><div className="contact-card contact-address"><p className="eyebrow">Visit</p><h2>Elite Kidz</h2><p>11-3-178/2<br />New Mallepally<br />Hyderabad</p></div><div className="contact-card"><p className="eyebrow">Get in touch</p><a className="contact-action" href="tel:+917702426007"><span className="contact-icon"><Icon name="phone" /></span><span><b>Call</b><small>7702426007</small></span><Icon name="arrow" size={18} /></a><a className="contact-action" href="mailto:elitekidss@outlook.com"><span className="contact-icon"><Icon name="mail" /></span><span><b>Email</b><small>elitekidss@outlook.com</small></span><Icon name="arrow" size={18} /></a><a className="contact-action" href={`https://wa.me/${WHATSAPP_NUMBER}`} target="_blank" rel="noreferrer"><span className="contact-icon"><Icon name="whatsapp" /></span><span><b>WhatsApp</b><small>Message Elite Kidz</small></span><Icon name="arrow" size={18} /></a></div></div></main>;
}

function Faq() {
  const questions = [
    ["How do I place an order?", "Choose a piece and size, add it to your bag, then continue on WhatsApp. We confirm availability and final details with you personally."],
    ["What sizes are available?", "Sizes vary by piece. Each product page shows the size labels currently available for that item; message us on WhatsApp for final stock confirmation and fit guidance."],
    ["How quickly will I hear back?", "We reply during our normal WhatsApp hours and confirm the next step as soon as possible."],
    ["Can I ask about a piece before ordering?", "Yes. Use the WhatsApp button on any product card or product page and we will help with size and styling questions."],
    ["Do you accept returns?", "Please contact us before ordering if you need help with fit. Return and exchange guidance is confirmed with you on WhatsApp before the order is finalised."]
  ];
  const [openQuestion, setOpenQuestion] = useState(0);
  return <main id="main-content" className="content-page section-shell"><div className="page-intro narrow"><p className="eyebrow">Good to know</p><h1>Questions, made<br /><em>a little easier.</em></h1><p>Everything you need to browse and order the current Elite Kidz edit with confidence.</p></div><div className="faq-list">{questions.map(([question, answer], index) => <div className={`faq-item ${openQuestion === index ? "is-open" : ""}`} key={question}><button aria-expanded={openQuestion === index} onClick={() => setOpenQuestion(openQuestion === index ? -1 : index)}><span>{question}</span><Icon name={openQuestion === index ? "minus" : "plus"} size={17} /></button>{openQuestion === index && <div className="faq-answer"><p>{answer}</p></div>}</div>)}</div><div className="page-cta"><p className="eyebrow">Still wondering?</p><h2>We’re just a message<br /><em>away.</em></h2><a className="button button-dark" href={`https://wa.me/${WHATSAPP_NUMBER}`} target="_blank" rel="noreferrer"><Icon name="whatsapp" size={18} /> Ask on WhatsApp</a></div></main>;
}

function SizeGuide() {
  const sizes = [...new Set(products.flatMap((product) => product.sizes))];
  return <main id="main-content" className="content-page section-shell"><div className="page-intro narrow"><p className="eyebrow">Find their fit</p><h1>The little<br /><em>size guide.</em></h1><p>The current edit is available in the sizes below. Exact fit guidance is confirmed with you on WhatsApp before the order is final.</p></div><div className="size-guide-wrap"><table className="size-guide"><caption>Current edit size range</caption><thead><tr><th scope="col">Size</th><th scope="col">Availability</th><th scope="col">Fit guidance</th></tr></thead><tbody>{sizes.map((size) => <tr key={size}><th scope="row">{size}</th><td>Current edit</td><td>Confirm with Elite Kidz</td></tr>)}</tbody></table></div><div className="size-notes"><div><p className="eyebrow">A better fit</p><h2>Measure without<br /><em>the fuss.</em></h2></div><ol><li>Tell us the child’s usual size and the piece you like.</li><li>Share any fit preference or measurements you already have.</li><li>If they are between sizes, message us and we will guide you piece by piece.</li></ol></div><a className="button button-dark" href={`https://wa.me/${WHATSAPP_NUMBER}`} target="_blank" rel="noreferrer"><Icon name="whatsapp" size={18} /> Ask about sizing</a></main>;
}

function ShippingReturns() {
  return <main id="main-content" className="content-page section-shell"><div className="page-intro narrow"><p className="eyebrow">Before you order</p><h1>Simple details,<br /><em>thoughtfully shared.</em></h1><p>Because every order is confirmed personally, we can help with availability, fit and delivery before anything is finalised.</p></div><div className="policy-grid"><article><p className="eyebrow">Ordering</p><h2>Personal, from the start.</h2><p>Choose your piece, select a size, and message us on WhatsApp. We confirm the available size, order details and next steps with you directly.</p></article><article><p className="eyebrow">Delivery</p><h2>Clear next steps.</h2><p>Delivery timing and charges depend on the destination and are confirmed before the order is final. For Hyderabad orders, we will share the local delivery details with you.</p></article><article><p className="eyebrow">Returns</p><h2>Help when you need it.</h2><p>Contact us before placing an order if you have a fit question. Any return or exchange guidance is discussed and confirmed on WhatsApp for the specific order.</p></article></div><div className="page-cta page-cta-soft"><p className="eyebrow">Need a hand?</p><h2>Let’s make it<br /><em>easy.</em></h2><a className="button button-dark" href={`https://wa.me/${WHATSAPP_NUMBER}`} target="_blank" rel="noreferrer"><Icon name="whatsapp" size={18} /> Chat with Elite Kidz</a></div></main>;
}

function CartDrawer({ items, onClose, onUpdate, onRemove, onOrder }) {
  const dialog = useRef(null);
  useEffect(() => { const prior=document.activeElement; const old=document.body.style.overflow; document.body.style.overflow='hidden'; dialog.current.showModal(); return () => { dialog.current?.close(); document.body.style.overflow=old; prior?.focus(); }; }, []);
  const count = items.reduce((sum, item) => sum + item.quantity, 0);
  return <dialog onKeyDown={trapDialogFocus} ref={dialog} className="drawer-layer" onCancel={onClose} aria-label="Shopping bag"><button className="drawer-backdrop" tabIndex={-1} aria-label="Close bag" onClick={onClose} /><aside className="cart-drawer"><div className="drawer-header"><div><p className="eyebrow">Your selection</p><h2>Shopping bag <span>{count}</span></h2></div><button className="icon-button" onClick={onClose} aria-label="Close bag"><Icon name="close" /></button></div>{items.length ? <><div className="cart-items">{items.map((item) => <div className="cart-item" key={`${item.product.id}-${item.size}`}><img src={item.product.images[0]} alt={item.product.alt} /><div className="cart-item-copy"><h3>{item.product.name}</h3><p>{item.product.colour}</p><p>Size: {item.size}</p><p>Price on enquiry</p><div className="cart-item-bottom"><div className="quantity-control small"><button onClick={() => onUpdate(item, item.quantity - 1)} aria-label="Decrease quantity"><Icon name="minus" size={14} /></button><span>{item.quantity}</span><button onClick={() => onUpdate(item, item.quantity + 1)} aria-label="Increase quantity"><Icon name="plus" size={14} /></button></div><button className="remove-link" onClick={() => onRemove(item)}>Remove</button></div></div></div>)}</div><div className="cart-footer"><p className="cart-note">Size availability and final order details are confirmed directly on WhatsApp.</p><button className="button button-dark button-wide" onClick={onOrder}><Icon name="whatsapp" size={18} /> Enquire on WhatsApp</button></div></> : <div className="empty-cart"><Icon name="bag" size={30} /><h3>Your bag is waiting.</h3><p>Start with a piece from the current collection.</p><a className="button button-outline" href="#/shop" onClick={onClose}>Explore the collection</a></div>}</aside></dialog>;
}

function AssistantPanel({ open, onOpen, onClose }) {
  const [available, setAvailable] = useState(false);
  useEffect(() => { const controller = new AbortController(); fetch('/api/assistant/status', {signal:controller.signal}).then(r => r.ok ? r.json() : null).then(data => setAvailable(data?.available === true)).catch(() => {}); return () => controller.abort(); }, []);
  const dialog = useRef(null);
  const [messages, setMessages] = useState([{ role: "assistant", content: "Hi, I’m Astra. I can help you find a piece, compare styles, or check the sizes shown in our current edit." }]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!open) return undefined;
    const oldOverflow=document.body.style.overflow; document.body.style.overflow='hidden'; dialog.current.showModal();
    const focusInput = window.setTimeout(() => document.getElementById("assistant-input")?.focus(), 0);
    const closeOnEscape = (event) => { if (event.key === "Escape") onClose(); };
    window.addEventListener("keydown", closeOnEscape);
    return () => { dialog.current?.close(); document.body.style.overflow=oldOverflow; window.clearTimeout(focusInput); window.removeEventListener("keydown", closeOnEscape); };
  }, [open, onClose]);

  const sendMessage = async (event) => {
    event.preventDefault();
    const text = input.trim();
    if (!text || loading) return;
    const nextMessages = [...messages, { role: "user", content: text }];
    setMessages(nextMessages);
    setInput("");
    setLoading(true);
    try {
      const response = await fetch("/api/assistant", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ messages: nextMessages }) });
      const data = await response.json();
      if (!response.ok) throw new Error("Astra is unavailable right now. Please contact Elite Kidz on WhatsApp at +91 77024 26007 for help.");
      setMessages((current) => [...current, { role: "assistant", content: data.message }]);
    } catch (error) {
      setMessages((current) => [...current, { role: "assistant", content: error.message }]);
    } finally {
      setLoading(false);
    }
  };

  if (!available) return <a className="assistant-launcher" href={`https://wa.me/${WHATSAPP_NUMBER}`} target="_blank" rel="noreferrer" aria-label="Ask Elite Kidz on WhatsApp"><Icon name="whatsapp" size={18}/><span>Ask Elite Kidz</span></a>;
  return <>
    <button className="assistant-launcher" onClick={onOpen} aria-label="Open Astra shopping assistant"><Icon name="sparkle" size={18} /><span>Ask Astra</span></button>
    {open && <dialog onKeyDown={trapDialogFocus} ref={dialog} className="assistant-layer" aria-label="Astra shopping assistant" onCancel={onClose}><button className="assistant-backdrop" tabIndex={-1} aria-label="Close Astra assistant" onClick={onClose} /><aside className="assistant-panel" role="dialog" aria-modal="true" aria-labelledby="assistant-title"><div className="assistant-header"><div><p className="eyebrow">Elite Kidz assistant</p><h2 id="assistant-title">Ask Astra</h2></div><button className="icon-button" onClick={onClose} aria-label="Close assistant"><Icon name="close" /></button></div><div className="assistant-messages" aria-live="polite">{messages.map((message, index) => <div className={`assistant-message ${message.role}`} key={`${message.role}-${index}`}><span className="assistant-message-label">{message.role === "assistant" ? "Astra" : "You"}</span><p>{message.content}</p></div>)}{loading && <div className="assistant-message assistant"><span className="assistant-message-label">Astra</span><p className="assistant-typing">Thinking<span>·</span><span>·</span><span>·</span></p></div>}</div><div className="assistant-prompts"><button onClick={() => setInput("Which dress would you recommend for a special day?")}>Recommend a dress</button><button onClick={() => setInput("What sizes are available?")}>Check sizes</button></div><form className="assistant-composer" onSubmit={sendMessage}><input id="assistant-input" value={input} onChange={(event) => setInput(event.target.value)} placeholder="Ask about the collection" aria-label="Ask Astra about the collection" /><button className="button button-dark" disabled={loading || !input.trim()} aria-label="Send message"><Icon name="arrow" size={17} /></button></form><p className="assistant-footnote">Astra can help with the catalog. Final availability and orders are confirmed on WhatsApp.</p></aside></dialog>}
  </>;
}

function NotFound() { return <main id="main-content" className="not-found section-shell"><p className="eyebrow">Page not found</p><h1>That little page<br /><em>has wandered off.</em></h1><a className="button button-dark" href="#/">Back to Elite Kidz</a></main>; }

function App() {
  const route = useHashRoute();
  const [cart, setCart] = useState(() => { try { const saved=JSON.parse(localStorage.getItem("elite-kidz-cart") || "[]"); return Array.isArray(saved) ? saved.flatMap(item=>{ const product=products.find(p=>p.id===item.product?.id); return product && product.sizes.includes(item.size) && Number.isInteger(item.quantity) && item.quantity>0 ? [{product,size:item.size,quantity:item.quantity}] : []; }) : []; } catch { return []; } });
  const [cartOpen, setCartOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [assistantOpen, setAssistantOpen] = useState(false);
  const [search, setSearch] = useState("");
  useEffect(() => { try { localStorage.setItem("elite-kidz-cart", JSON.stringify(cart)); } catch {} }, [cart]);
  useEffect(() => { document.title = route.page === "product" && getProduct(route.slug) ? `${getProduct(route.slug).name} — Elite Kidz` : route.page === "shop" ? "Shop — Elite Kidz" : route.page === "faq" ? "FAQ — Elite Kidz" : route.page === "size-guide" ? "Size Guide — Elite Kidz" : route.page === "shipping-returns" ? "Shipping & Returns — Elite Kidz" : "Elite Kidz — Made for Little Stars"; }, [route]);
  const cartCount = cart.reduce((sum, item) => sum + item.quantity, 0);
  const openWhatsApp = (product, size, quantity) => window.open(createWhatsAppUrl(cart, product, size, quantity), "_blank", "noopener,noreferrer");
  const addToCart = (product, quantity = 1, size) => { if (!product.sizes.includes(size)) return; setCart((current) => { const key = `${product.id}-${size}`; const found = current.find((item) => `${item.product.id}-${item.size}` === key); return found ? current.map((item) => `${item.product.id}-${item.size}` === key ? { ...item, quantity: item.quantity + quantity } : item) : [...current, { product, size, quantity }]; }); setCartOpen(true); };
  const updateCart = (item, quantity) => setCart((current) => quantity < 1 ? current.filter((entry) => entry !== item) : current.map((entry) => entry === item ? { ...entry, quantity } : entry));
  const removeCart = (item) => setCart((current) => current.filter((entry) => entry !== item));
  const page = route.page === "home" ? <Home onQuickAsk={openWhatsApp} onAdd={addToCart} /> : route.page === "shop" ? <Shop key={route.query.toString()} route={route} onQuickAsk={openWhatsApp} onAdd={addToCart} /> : route.page === "product" ? <ProductPage key={route.slug} product={getProduct(route.slug)} onAdd={addToCart} onQuickAsk={openWhatsApp} /> : route.page === "about" ? <About /> : route.page === "contact" ? <Contact /> : route.page === "faq" ? <Faq /> : route.page === "size-guide" ? <SizeGuide /> : route.page === "shipping-returns" ? <ShippingReturns /> : <NotFound />;
  return <><a className="skip-link" href="#main-content">Skip to content</a><MotionLayer /><Header cartCount={cartCount} onOpenCart={() => setCartOpen(true)} onOpenSearch={() => setSearchOpen(true)} />{searchOpen && <SearchBar value={search} onChange={setSearch} onClose={() => { setSearchOpen(false); setSearch(""); }} />}{page}<Footer />{cartOpen && <CartDrawer items={cart} onClose={() => setCartOpen(false)} onUpdate={updateCart} onRemove={removeCart} onOrder={() => openWhatsApp()} />}<AssistantPanel open={assistantOpen} onOpen={() => setAssistantOpen(true)} onClose={() => setAssistantOpen(false)} /></>;
}

window.addEventListener("load", () => { if (!window.location.hash) window.location.hash = "#/"; });
createRoot(document.getElementById("root")).render(<App />);
