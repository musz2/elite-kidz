import { clientMedia } from './clientMedia.js';
import { orderSizes } from './sizes.js';
const SUPPLIED_SIZES = orderSizes(['1Y','2Y','3Y','4Y','5Y','6Y','7Y']);
const supplied = (slug, itemNumber, name, type, colour) => ({
  id:slug, slug, itemNumber, name, collection:'Current edit', category:'Girls', type, colour, status:'Current edit', sizes:[...SUPPLIED_SIZES],
  detail:`Style ${itemNumber}. Measurements for every size are on the size guide; please confirm current availability with Elite Kidz on WhatsApp.`,
  images:clientMedia[slug], alt:name+' from Elite Kidz', tags:['Girls',type,colour,itemNumber],
  video:'/assets/products/client-september/tulip-collection.mp4', videoLabel:'Watch the tulip collection',
  sizeChart:`#/size-guide?style=${itemNumber}`
});
export const newProducts = [
  {...supplied('sage-babydoll-blouse-lx0063','LX0063','Sage Sleeveless Babydoll Blouse','Top','Sage green'), material:'100% cotton', materialImage:'/assets/products/client-september/photo-050.jpg'},
  {...supplied('ivory-tulip-pants-x5013','X5013','Ivory Tulip Pants','Trousers','Natural ivory'), material:'100% cotton jacquard; combed cotton lining', materialImage:'/assets/products/client-september/photo-052.jpg'},
  {...supplied('ivory-tulip-dress-x5014','X5014','Ivory Tulip Dress','Dress','Natural ivory'), material:'100% cotton jacquard', materialImage:'/assets/products/client-september/photo-052.jpg', video:'/assets/products/client-september/tulip-collection.mp4', videoLabel:'Watch the tulip collection'}
];
