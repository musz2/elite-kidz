import { clientMedia } from './clientMedia.js';
const sizes = ['1-2Y','2-3Y','3-4Y','4-5Y','5-6Y','6-7Y','7-8Y'];
const supplied = (slug, itemNumber, name, type, colour) => ({
  id:slug, slug, itemNumber, name, collection:'Current edit', category:'Girls', type, colour, status:'Current edit', sizes:[...sizes],
  detail:`Style ${itemNumber}. Sizes are shown in the supplied size chart; please confirm current availability with Elite Kidz on WhatsApp.`,
  images:clientMedia[slug], alt:name+' from Elite Kidz', tags:['Girls',type,colour,itemNumber],
  sizeChart:'/assets/products/client-september/photo-054.jpg'
});
export const newProducts = [
  {...supplied('sage-babydoll-blouse-lx0063','LX0063','Sage Sleeveless Babydoll Blouse','Top','Sage green'), material:'100% cotton', materialImage:'/assets/products/client-september/photo-050.jpg'},
  {...supplied('ivory-tulip-pants-x5013','X5013','Ivory Tulip Pants','Trousers','Natural ivory'), material:'100% cotton jacquard; combed cotton lining', materialImage:'/assets/products/client-september/photo-052.jpg'},
  {...supplied('ivory-tulip-dress-x5014','X5014','Ivory Tulip Dress','Dress','Natural ivory'), material:'100% cotton jacquard', materialImage:'/assets/products/client-september/photo-052.jpg', video:'/assets/products/client-september/tulip-collection.mp4', videoLabel:'Watch the tulip collection'}
];
