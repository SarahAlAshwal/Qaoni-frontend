import React, { type FC } from 'react'
import Slideshow from '../Slideshow';
import FeaturedShops from '../Layouts/FeaturedShops';
import offer1 from '../../assets/offer1.jpg';
import offer2 from '../../assets/offer2.jpg';
import offer3 from '../../assets/offer3.jpg';
import shop1 from '../../assets/shop1.jpeg';
import shop2 from '../../assets/shop2.jpeg';
import shop3 from '../../assets/shop3.jpeg';
import shop4 from '../../assets/shop4.jpeg';
import shop5 from '../../assets/shop5.png';

const HomePage: FC = () => {
    const slidesImages = [
    { image: offer1, link: '/', alt: 'offer-image' },
    { image: offer2, link: '/', alt: 'offer-image' },
    { image: offer3, link: '/', alt: 'offer-image' }
  ]
  const shops = [
    {
    id: 'shop-01',
    name: 'First Shop',
    logo: shop1, // image url
    link: '/',
  },
  { id: 'shop-02',
    name: 'Second Shop',
    logo: shop2, // image url
    link: '/',
  },
  { id: 'shop-03',
    name: 'Third Shop',
    logo: shop3, // image url
    link: '/',
  },
  { id: 'shop-04',
    name: 'Fourth Shop',
    logo: shop4, // image url
    link: '/',
  },
  { id: 'shop-05',
    name: 'Fifth Shop',
    logo: shop5, // image url
    link: '/',
  },
  {
    id: 'shop-06',
    name: 'Sixth Shop',
    logo: shop1, // image url
    link: '/',
  },
  { id: 'shop-07',
    name: 'Seventh Shop',
    logo: shop2, // image url
    link: '/',
  },
  { id: 'shop-08',
    name: 'Eighth Shop',
    logo: shop3, // image url
    link: '/',
  },
   {
    id: 'shop-09',
    name: 'First Shop',
    logo: shop1, // image url
    link: '/',
  },
  { id: 'shop-10',
    name: 'Second Shop',
    logo: shop2, // image url
    link: '/',
  },
  { id: 'shop-11',
    name: 'Third Shop',
    logo: shop3, // image url
    link: '/',
  },
  { id: 'shop-12',
    name: 'Fourth Shop',
    logo: shop4, // image url
    link: '/',
  },
  { id: 'shop-13',
    name: 'Fifth Shop',
    logo: shop5, // image url
    link: '/',
  },
  {
    id: 'shop-14',
    name: 'Sixth Shop',
    logo: shop1, // image url
    link: '/',
  },
  { id: 'shop-15',
    name: 'Seventh Shop',
    logo: shop2, // image url
    link: '/',
  },
  { id: 'shop-16',
    name: 'Eighth Shop',
    logo: shop3, // image url
    link: '/',
  },
   {
    id: 'shop-17',
    name: 'First Shop',
    logo: shop1, // image url
    link: '/',
  },
  { id: 'shop-18',
    name: 'Second Shop',
    logo: shop2, // image url
    link: '/',
  },
  { id: 'shop-19',
    name: 'Third Shop',
    logo: shop3, // image url
    link: '/',
  },
  { id: 'shop-20',
    name: 'Fourth Shop',
    logo: shop4, // image url
    link: '/',
  },
  { id: 'shop-21',
    name: 'Fifth Shop',
    logo: shop5, // image url
    link: '/',
  },
  {
    id: 'shop-22',
    name: 'Sixth Shop',
    logo: shop1, // image url
    link: '/',
  },
  { id: 'shop-23',
    name: 'Seventh Shop',
    logo: shop2, // image url
    link: '/',
  },
  { id: 'shop-24',
    name: 'Eighth Shop',
    logo: shop3, // image url
    link: '/',
  },
   {
    id: 'shop-25',
    name: 'First Shop',
    logo: shop1, // image url
    link: '/',
  },
  { id: 'shop-26',
    name: 'Second Shop',
    logo: shop2, // image url
    link: '/',
  },
  { id: 'shop-27',
    name: 'Third Shop',
    logo: shop3, // image url
    link: '/',
  },
  { id: 'shop-28',
    name: 'Fourth Shop',
    logo: shop4, // image url
    link: '/',
  },
  { id: 'shop-29',
    name: 'Fifth Shop',
    logo: shop5, // image url
    link: '/',
  },
  {
    id: 'shop-30',
    name: 'Sixth Shop',
    logo: shop1, // image url
    link: '/',
  },
  { id: 'shop-31',
    name: 'Seventh Shop',
    logo: shop2, // image url
    link: '/',
  },
  { id: 'shop-32',
    name: 'Eighth Shop',
    logo: shop3, // image url
    link: '/',
  },
]
    return(
        <main className="flex-grow">
            <Slideshow slides={slidesImages} />
            <FeaturedShops shops={shops} />
            {/* Page content here */}
      </main>
    );
}

export default HomePage;