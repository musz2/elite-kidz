import { useEffect, useLayoutEffect, useRef, useState } from 'react';
import { trapDialogFocus } from './dialog';
import { galleryImages, imagePreview } from './media';

const clamp = (n, min, max) => Math.max(min, Math.min(n, max));

function ExpandedGallery({ product, images, initialIndex, onClose }) {
  const dialog = useRef(null);
  const viewport = useRef(null);
  const [index, setIndex] = useState(initialIndex);
  const [zoomed, setZoomed] = useState(false);
  const [natural, setNatural] = useState({ width: 1, height: 1 });
  const [box, setBox] = useState({ width: 1, height: 1 });
  const dragging = useRef(null);
  useEffect(() => {
    const prior = document.activeElement;
    const oldOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    dialog.current.showModal();
    const observer = new ResizeObserver(([entry]) => setBox({ width: entry.contentRect.width, height: entry.contentRect.height }));
    observer.observe(viewport.current);
    return () => { observer.disconnect(); dialog.current?.close(); document.body.style.overflow = oldOverflow; prior?.focus(); };
  }, []);
  useLayoutEffect(() => {
    const el = viewport.current;
    el.scrollLeft = (el.scrollWidth - el.clientWidth) / 2;
    el.scrollTop = (el.scrollHeight - el.clientHeight) / 2;
  }, [zoomed]);
  const fit = Math.min(box.width / natural.width, box.height / natural.height, 1);
  const scale = zoomed ? Math.min(1, fit * 3) : fit;
  const change = (delta) => { setIndex(i => (i + delta + images.length) % images.length); setZoomed(false); };
  return <dialog ref={dialog} className="image-viewer" onCancel={onClose} onKeyDown={e => { trapDialogFocus(e); if(e.key === 'ArrowRight') change(1); if(e.key === 'ArrowLeft') change(-1); }} aria-label={`${product.name} image viewer`}>
    <div className="viewer-header"><div><strong>{product.name}</strong><span>{index + 1} / {images.length}</span></div><button className="icon-button" onClick={onClose} aria-label="Close image viewer">✕</button></div>
    <div ref={viewport} className={`viewer-viewport ${zoomed ? 'is-zoomed' : ''}`} onDoubleClick={() => setZoomed(z => !z)}
      onPointerDown={e => { if(e.pointerType === 'mouse' && zoomed) { e.currentTarget.setPointerCapture(e.pointerId); dragging.current = { x:e.clientX, y:e.clientY, left:e.currentTarget.scrollLeft, top:e.currentTarget.scrollTop }; } }}
      onPointerMove={e => { if(dragging.current) { e.currentTarget.scrollLeft = dragging.current.left - e.clientX + dragging.current.x; e.currentTarget.scrollTop = dragging.current.top - e.clientY + dragging.current.y; } }}
      onPointerUp={() => { dragging.current = null; }} onPointerCancel={() => { dragging.current = null; }}>
      <div className="viewer-image-space" style={{width:Math.max(box.width, natural.width * scale), height:Math.max(box.height,natural.height * scale)}}>
        <img src={images[index]} alt={`${product.name}, view ${index + 1}`} draggable="false" onLoad={e => setNatural({width:e.currentTarget.naturalWidth,height:e.currentTarget.naturalHeight})} style={{width:natural.width * scale,height:natural.height * scale}} />
      </div>
    </div>
    <div className="viewer-controls"><button className="icon-button" onClick={() => change(-1)} disabled={images.length < 2} aria-label="Previous image">←</button><button className="button button-outline" onClick={() => setZoomed(z => !z)}>{zoomed ? '− Zoom out' : '+ Zoom in'}</button><button className="icon-button" onClick={() => change(1)} disabled={images.length < 2} aria-label="Next image">→</button></div>
    <p className="viewer-help">{zoomed ? 'Drag or swipe to explore the detail. Double tap to zoom out.' : 'Double tap or use + to see the details.'}</p>
  </dialog>;
}

export default function ProductGallery({ product }) {
  const images = galleryImages(product);
  const video = product.video || null;
  // The film sits at the end of the thumbnail rail, after the photographs.
  const filmIndex = video ? images.length : -1;
  const count = images.length + (video ? 1 : 0);
  const [index, setIndex] = useState(0);
  const showingFilm = index === filmIndex;
  const [expanded, setExpanded] = useState(false);
  const [zoom, setZoom] = useState(false);
  const stage = useRef(null);
  const original = useRef(null);
  const lens = useRef(null);
  const preview = useRef(null);
  const zoomImage = useRef(null);
  const canZoom = useRef(false);
  const lastPointer = useRef(null);
  useEffect(() => {
    const query = matchMedia('(min-width: 1000px) and (hover: hover) and (pointer: fine)');
    const update = () => { canZoom.current = query.matches; setZoom(false); };
    update(); query.addEventListener('change', update);
    return () => query.removeEventListener('change', update);
  }, []);
  // The stage element is replaced when the film is selected, so the observer is
  // re-attached to whichever stage is currently mounted.
  useEffect(() => {
    if(!stage.current) return;
    const observer = new ResizeObserver(() => { if(lastPointer.current) track(lastPointer.current); else setZoom(false); });
    observer.observe(stage.current);
    return () => observer.disconnect();
  }, [showingFilm]);
  // The lens and preview use the same image-space rectangle. Pointer tracking has
  // no easing and doesn't re-render React. Letterboxing is explicitly excluded.
  function track(e) {
    lastPointer.current = {clientX:e.clientX,clientY:e.clientY,pointerType:e.pointerType};
    if(!canZoom.current || e.pointerType !== 'mouse' || !original.current?.naturalWidth) return;
    const bounds = stage.current.getBoundingClientRect();
    const img = original.current;
    const fit = Math.min(bounds.width / img.naturalWidth, bounds.height / img.naturalHeight);
    const width = img.naturalWidth * fit, height = img.naturalHeight * fit;
    const offsetX = (bounds.width - width) / 2, offsetY = (bounds.height - height) / 2;
    const px = e.clientX - bounds.left - offsetX, py = e.clientY - bounds.top - offsetY;
    if(px < 0 || px > width || py < 0 || py > height) { setZoom(false); return; }
    const previewWidth = preview.current.clientWidth, previewHeight = preview.current.clientHeight;
    // Never enlarge beyond original pixels. Existing lower-resolution photos
    // receive a smaller magnification ratio than the 1440/1600px originals.
    const magnification = Math.min(2.8, 1 / fit);
    if(magnification <= 1 || previewWidth / magnification > width || previewHeight / magnification > height) { setZoom(false); return; }
    const lensWidth = previewWidth / magnification, lensHeight = previewHeight / magnification;
    const x = clamp(px - lensWidth / 2, 0, width - lensWidth);
    const y = clamp(py - lensHeight / 2, 0, height - lensHeight);
    Object.assign(lens.current.style, {width:`${lensWidth}px`,height:`${lensHeight}px`,left:`${x + offsetX}px`,top:`${y + offsetY}px`});
    Object.assign(zoomImage.current.style, {width:`${width * magnification}px`,height:`${height * magnification}px`,transform:`translate(${-x * magnification}px, ${-y * magnification}px)`});
    setZoom(true);
  }
  return <div className="premium-gallery">
    <div className="thumbnail-rail" aria-label="Product photographs">
      {images.map((src, i) => <button key={src} className={i === index ? 'active' : ''} aria-label={`Show ${product.name} image ${i + 1}`} aria-pressed={i === index} onClick={() => { setIndex(i); lastPointer.current = null; setZoom(false); }}><img src={imagePreview(src,160)} alt="" loading="lazy" /></button>)}
      {video && <button className={`thumbnail-film ${showingFilm ? 'active' : ''}`} aria-label={`Play the ${product.name} film`} aria-pressed={showingFilm} onClick={() => { setIndex(filmIndex); lastPointer.current = null; setZoom(false); }}><img src={imagePreview(images[0],160)} alt="" loading="lazy" /><span aria-hidden="true"><svg width="9" height="11" viewBox="0 0 9 11"><path d="M0 0v11l9-5.5z" fill="currentColor" /></svg></span></button>}
    </div>
    <div className="gallery-primary">
      {showingFilm
        ? <div className="product-stage product-stage-film"><video className="stage-film" controls autoPlay muted loop playsInline preload="auto" poster={imagePreview(images[0],960)} src={video} aria-label={`${product.name} film`} /></div>
        : <button ref={stage} className="product-stage" aria-label={`Expand ${product.name} photograph`} onClick={() => { setZoom(false); setExpanded(true); }} onPointerMove={track} onPointerLeave={() => { lastPointer.current = null; setZoom(false); }}>
            <img ref={original} key={images[index]} className="primary-photograph" src={images[index]} alt={product.alt} fetchPriority="high" draggable="false" />
            <span ref={lens} className={`zoom-lens ${zoom ? 'is-active' : ''}`} aria-hidden="true" />
            <span className="expand-image" aria-hidden="true">↗</span>
          </button>}
      <div className="gallery-caption"><span>{String(index + 1).padStart(2,'0')} / {String(count).padStart(2,'0')}</span>{showingFilm ? <span>{product.videoLabel || 'The piece in motion'}</span> : <><span className="desktop-zoom-copy">Hover to explore · Click to expand</span><span className="touch-zoom-copy">Tap to explore the details</span></>}</div>
      <div ref={preview} className={`zoom-preview ${zoom ? 'is-active' : ''}`} aria-hidden="true"><img ref={zoomImage} src={showingFilm ? images[0] : images[index]} alt="" /></div>
    </div>
    {expanded && !showingFilm && <ExpandedGallery product={product} images={images} initialIndex={index} onClose={() => setExpanded(false)} />}
  </div>;
}
