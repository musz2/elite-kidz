import { useEffect } from 'react';
export function MotionLayer() {
  useEffect(() => {
    const media = matchMedia('(prefers-reduced-motion: reduce)');
    const changeRoute = () => {
      window.scrollTo({top:0,behavior:'instant'});
      if (!media.matches) document.querySelector('main')?.animate([{opacity:.65,transform:'translateY(8px)'},{opacity:1,transform:'none'}],{duration:260,easing:'cubic-bezier(.22,1,.36,1)'});
    };
    const move = e => {
      if(media.matches || e.pointerType !== 'mouse' || innerWidth < 1000) return;
      const hero=e.target.closest('.fashion-hero');
      if(!hero) return;
      const b=hero.getBoundingClientRect();
      hero.style.setProperty('--depth-x',`${(e.clientX-b.left-b.width/2)/b.width*8}px`);
      hero.style.setProperty('--depth-y',`${(e.clientY-b.top-b.height/2)/b.height*6}px`);
    };
    window.addEventListener('hashchange',changeRoute);
    document.addEventListener('pointermove',move,{passive:true});
    return ()=>{window.removeEventListener('hashchange',changeRoute);document.removeEventListener('pointermove',move);};
  },[]);
  return null;
}
