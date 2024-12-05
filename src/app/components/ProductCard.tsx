import { useCart } from '../(pages)/(usuario)/CartContext';
import { ProductWithImages } from '../types/shared';
import React, { useState } from 'react';

type ProductWithUser = ProductWithImages & { user: { username: string } };

const ProductCard = ({ product }: { product: ProductWithUser }) => {
    const [count, setCount] = useState(1);
    const { addToCart, cart } = useCart();

    const currentInCart = cart.filter(item => item.product.id === product.id).length;

    const increment = () => {
        if (count + currentInCart < product.quantity) {
            setCount(count + 1);
        }
    };

    const decrement = () => setCount(count > 1 ? count - 1 : 1);

    const handleAddToCart = () => {
        if (count + currentInCart > product.quantity) {
            alert(`Estoque insuficiente! Restam apenas ${product.quantity - currentInCart} unidade(s) disponível(is).`);
            return;
        }
        for (let i = 0; i < count; i++) {
            addToCart(product);
        }
        setCount(1); // Resetando o contador após o sucesso
    };

    return (
        <div className="product-card border rounded-lg p-4 flex flex-col items-center">
            <div className="product-image mb-4">
                {product.images?.length ? (
                    <img src={product.images[0].imageUrl} alt={product.name} className="w-full h-48 object-cover rounded-t-lg" />
                ) : (
                    <p>Sem imagens disponíveis</p>
                )}
            </div>
            <div className="product-info text-center mb-4">
                <h2 className="font-bold text-lg">{product.name}</h2>
                <p>{product.description}</p>
                <p>Preço: R${product.price.toFixed(2)}</p>
                <p>Estoque: {product.quantity}</p>
                <p>Vendedor: {product.user.username}</p>
            </div>
            <div className="counter flex items-center mb-4">
                <button
                    onClick={decrement}
                    className="px-2 py-1 border rounded-l-lg"
                    disabled={count <= 1}
                >
                    -
                </button>
                <span className="px-4">{count}</span>
                <button
                    onClick={increment}
                    className="px-2 py-1 border rounded-r-lg"
                    disabled={count + currentInCart >= product.quantity}
                >
                    +
                </button>
            </div>
            <button
                className="bg-blue-500 text-white px-4 py-2 rounded-lg"
                onClick={handleAddToCart}
                disabled={currentInCart >= product.quantity}
            >
                {currentInCart >= product.quantity ? 'Esgotado' : 'Adicionar ao Carrinho'}
            </button>
        </div>
    );
};

export default ProductCard;