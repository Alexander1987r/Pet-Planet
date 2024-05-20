const storeList=document.querySelector('.store__list');
//адресс
const API_URL= 'https://sequoia-half-screen.glitch.me';

//функция создания карточки
const createCard=({id,name,price,photoUrl})=>{
  const storeItem=document.createElement('li');
  storeItem.classList.add('store__item');
  storeItem.innerHTML=`
  <article class="store__product product">
  <h3 class="product__title">${name}</h3>
  <img class="product__image" src="${API_URL}${photoUrl
  }" alt="${name}" width="264" height="229">
  <b class="product__price">${price} ₽</b>
  <button class="product__button" data-id=${id} type="button">
      Заказать
  </button>
</article>
  `;
  return storeItem;
}

//функция ррендеринга списка
const renderProducts=(products)=>{
    storeList.innerHTML='';
    products.forEach((product)=>{
        const productCard=createCard(product);
        storeList.appendChild(productCard);
    });
}

//методом async(await)
export const fetchProductByCategory=async(category)=>{
    try{
       const responce=await fetch(`${API_URL}//api/products/category/${category}`);
       if(!responce.ok){
        throw new Error(responce.status);
       }
       const products=await responce.json();
       //вызов функции рендеринга списка
       renderProducts(products);
   } catch (error){
    console.error('Ошибка',error);  
    }
}