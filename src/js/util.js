 

import { getFetching } from "./data.js";

//апи сервера
const API_URL= 'https://sequoia-half-screen.glitch.me';
//тоглы переключения
const storeCategoriesButton=document.querySelectorAll('.store__categories-button');

const storeList=document.querySelector('.store__list');
const storButton=document.querySelector('.store__button');
const storeButtonCount=storButton.querySelector('.store__button-count');

const  modalOverlay=document.querySelector('.modal-overlay');
const  modalOverlayButton=modalOverlay.querySelector('.modal-overlay_button');
const  modalList=modalOverlay.querySelector('.modal__list');

const  cartTotalPriceElement=modalOverlay.querySelector('.form__price');


const modalCartForm=document.querySelector('.form');
//cообщение заказа
const orderMessageElement=document.createElement('div');
orderMessageElement.classList.add('order-message');

const orderMessageText=document.createElement('p');
orderMessageText.classList.add('order-message__text');

const orderMessageCloseButton=document.createElement('button');
orderMessageCloseButton.classList.add('order-message__close-button');
orderMessageCloseButton.textContent="Закрыть";

orderMessageElement.append(orderMessageText,orderMessageCloseButton);

orderMessageCloseButton.addEventListener('click',()=>{
    orderMessageElement.remove();
});


//активный класс линка
export const getActiveCategory=()=>{
//функция активного тогла
const getActiveToggle=({target})=>{
    console.log(target.textContent);
    storeCategoriesButton.forEach((elem)=>{
    elem.classList.remove('store__categories-button_active');
    target.classList.add('store__categories-button_active');
    });
    getFetching(target.textContent);
}
//слушатель на активный тогл
storeCategoriesButton.forEach((item)=>{
    item.addEventListener('click',getActiveToggle); 
    if(item.classList.contains('store__categories-button_active')){
        getFetching(item.textContent);
    }
});
}

//модальное окно
export const showModal=()=>{
    //обновление счетчика
    const updateCartCount=()=>{
        const products=JSON.parse(localStorage.getItem("products") || "[]");
        storeButtonCount.textContent=products.length;
    }
    //добавление в local (корзина)
    const addSelectedProducts=(productId)=>{
        
        const products=JSON.parse(localStorage.getItem("products") || "[]");
        const isPresentId= products.find(elem=> elem.id === productId);
        if(isPresentId){
         isPresentId.count+=1;
        } else {
            products.push({id:productId,count:1});
        }

        localStorage.setItem("products",JSON.stringify(products));
        updateCartCount();
    }
    //обработчик клика на тогл заказа
    storeList.addEventListener('click',({target})=>{
     if(target.closest('.product__button')){
        const productId=target.dataset.id;
        addSelectedProducts(productId);
     }
    });
    updateCartCount();

    












    const fetchCartItems=async (ids)=>{
        
        try{
         const responce= await fetch(`${API_URL}/api/products/list/${ids.join(",")}`);
         if(!responce.ok){
          throw new Error(responce.status);
         }
         const products=await responce.json();
         return products;
        } catch(error){
         console.error(`Ошибка:${error}`);
         return [];
        }
    }
     //
    const calculateTotalPrice=(cartProductsAdd,products)=>{ 
        return cartProductsAdd.reduce((acc,item)=>{
            const product=products.find(prod=> prod.id === item.id );
             return  acc+Number(item.price)*product.count;
        },0);
    }

    // 
    const renderModalList=async ()=>{
        
        const products=JSON.parse(localStorage.getItem("products") || "[]");
        const cartProductsAdd=JSON.parse(localStorage.getItem("cartProductsAdd") || "[]")
        
        cartProductsAdd.forEach(({id,name,price,photoUrl})=>{
            const cartProduct=products.find((item)=> item.id === id);
            if(!cartProduct) {
            return;
            }
            const listItem=document.createElement('li');
            listItem.classList.add('modal__item');
            listItem.innerHTML=`
            <h3 class="modal__item-title">
             ${name} 
            </h3>
            <img class="modal__item-image" src="${API_URL}${photoUrl}" alt="${name}" width="54" height="54">
            <div class="modal__item-buttons">
            <button class="modal__item-button modal__item-button_minus" type="button" data-id=${id}>-</button>
            <span class="modal__item-count">${cartProduct.count}</span>
            <button class="modal__item-button modal__item-button_plus" type="button" data-id=${id}>+</button>
            </div>
            <p class="modal__item-price">${price * cartProduct.count } ₽</p>
            `;
            modalList.append(listItem);
        });
       const totalPrice=calculateTotalPrice(cartProductsAdd,products);
       cartTotalPriceElement.innerHTML=`${totalPrice} ₽`;
     }
    //
    const openModal= async()=>{
        modalOverlay.style.display='flex';
        modalList.textContent='';
        const products=JSON.parse(localStorage.getItem("products") || "[]");
        const idArray=products.map(item => item.id);
        
        if(!idArray.length){
         const item=document.createElement('li');
         item.textContent='Корзина пуста';
         modalList.append(item);
        }
        const productsAdd=await fetchCartItems(idArray); 
        localStorage.setItem('cartProductsAdd',JSON.stringify(productsAdd));
        renderModalList();
        modalOverlayButton.addEventListener('click',closeModal);
        
    }
    //
    const closeModal=()=>{
        modalOverlay.style.display='none';  
        modalOverlayButton.removeEventListener('click',closeModal);
    }
    storButton.addEventListener('click',openModal);
    
    
    const updateCartItem=(productId,change)=>{
        const products=JSON.parse(localStorage.getItem("products") || "[]");
        console.log(products);
        const itemIndex=products.findIndex( item=>item.id === productId );
        
        if(itemIndex !== -1){
           products[itemIndex].count += change;
        }
        if( products[itemIndex].count <=0 ){
           products.splice(itemIndex,1);
        }
        localStorage.setItem("products",JSON.stringify(products));
        modalList.textContent='';
        updateCartCount();
        renderModalList();
    }
    //обработчик на можальном окне
    modalList.addEventListener('click',({target})=>{
           if(target.classList.contains('modal__item-button_plus')){
               const productId=target.dataset.id;
               console.log(productId);
               updateCartItem(productId,1)
           }
           if(target.classList.contains('modal__item-button_minus')){
               const productId=target.dataset.id;
               updateCartItem(productId,-1)
           }
    });

    const submitOrder=async(evt)=>{
        evt.preventDefault(); 
        //значенеи 
        const storeId=modalCartForm.store.value;
        const products=JSON.parse(localStorage.getItem("products") || "[]");
        console.log(products);  
        //переберем массив
        const prodOrder=products.map(({id,count})=>{
          return {id:id,
                  quantity:count
              }
        });
        //отправка на сервер
        try{
         const responce=await fetch(`${API_URL}/api/orders`,{
          method:"POST",
          headers:{
              "Content-Type":"application/json",
          },
          body:JSON.stringify({storeId,products})
         });
         if(!responce.ok){
          throw new Error(responce.status);
         }
      
      
         localStorage.removeItem("products");
         localStorage.removeItem("cartProductsAdd");
      
         const {orderId}=await responce.json();
         orderMessageText.textContent=`Ваш заказ оформлен,номер ${orderId}.Вы можете его забрать`;
         document.body.append(orderMessageElement);
         modalOverlay.style.display='none';
         updateCartCount();
        }catch(error){
          console.error(`Ошибка оформления заказа:${error}`);
        }
        console.log('prodOrder',prodOrder); 
    }
      
    //событие на форму 
    modalCartForm.addEventListener('submit',submitOrder);
}


 