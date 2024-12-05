"use client"

import { createContext, useContext, useState, useRef, useEffect } from "react"
import { useQueryClient } from "@tanstack/react-query"
import { completePurchase } from "@/app/server/actions/orders"
import { ProductWithImages } from "@/app/types/shared"

// Interface do contexto
interface CartContextType {
    cart: { product: ProductWithImages; quantity: number }[]
    addToCart: (product: ProductWithImages) => void
    removeFromCart: (productId: number) => void
    completePurchase: (address: { street: string; city: string; state: string; zip: string }, shippingCost: number) => void
    isCartOpen: boolean
    setIsCartOpen: (isOpen: boolean) => void
    address: { street: string; city: string; state: string; zip: string }
    setAddress: (address: { street: string; city: string; state: string; zip: string }) => void
    shippingCost: number
    calculateShipping: (address: { street: string; city: string; state: string; zip: string }) => void
    total: number // Expor o total calculado
    setCart: (cart: { product: ProductWithImages; quantity: number }[]) => void
}

// Criação do contexto
const CartContext = createContext<CartContextType | undefined>(undefined)

export const CartProvider = ({ children, user_id }: { children: React.ReactNode; user_id: number }) => {
    const queryClient = useQueryClient()
    const [cart, setCart] = useState<{ product: ProductWithImages; quantity: number }[]>([])
    const [isCartOpen, setIsCartOpen] = useState(false)
    const [address, setAddress] = useState({ street: "", city: "", state: "", zip: "" })
    const [shippingCost, setShippingCost] = useState(0)
    const [total, setTotal] = useState(0) // Novo estado para o total do carrinho
    const cartRef = useRef<HTMLDivElement>(null)

    // Atualiza o total do carrinho sempre que o estado mudar
    useEffect(() => {
        const calculateTotal = () => {
            const newTotal = cart.reduce((sum, item) => sum + item.product.price * item.quantity, 0)
            setTotal(newTotal)
        }
        calculateTotal()
    }, [cart])

    const addToCart = (product: ProductWithImages) => {
        setCart((prevCart) => {
            const existingProduct = prevCart.find((item) => item.product.id === product.id);
            const currentQuantity = existingProduct ? existingProduct.quantity : 0;
    
            if (currentQuantity + 1 > product.quantity) {
                alert(`Quantidade máxima atingida! Estoque disponível: ${product.quantity}`);
                return prevCart;
            }
    
            if (existingProduct) {
                return prevCart.map((item) =>
                    item.product.id === product.id ? { ...item, quantity: item.quantity + 1 } : item
                );
            } else {
                return [...prevCart, { product, quantity: 1 }];
            }
        });
    };
    

    const removeFromCart = (productId: number) => {
        setCart((prevCart) => {
            const existingProduct = prevCart.find((item) => item.product.id === productId);
            
            if (existingProduct) {
                if (existingProduct.quantity > 1) {
                    // Se a quantidade for maior que 1, apenas diminui a quantidade
                    return prevCart.map((item) =>
                        item.product.id === productId ? { ...item, quantity: item.quantity - 1 } : item
                    );
                } else {
                    // Se a quantidade for 1, remove o item completamente
                    return prevCart.filter((item) => item.product.id !== productId);
                }
            }
            return prevCart;
        });
    }

    const handleClickOutside = (event: MouseEvent) => {
        if (cartRef.current && !cartRef.current.contains(event.target as Node)) {
            setIsCartOpen(false)
        }
    }

    const handleCompletePurchase = async () => {
        if (!user_id) {
            alert("Usuário não autenticado.");
            return;
        }
    
        const res = await completePurchase(user_id, cart.map((item) => item.product), shippingCost, address);
        if (res.success) {
            setCart([]);
            setIsCartOpen(false);
            alert("Compra concluída com sucesso!");
        } else {
            alert("Erro ao concluir a compra: " + res.message);
        }
        queryClient.invalidateQueries({
            queryKey: ["orders", user_id],
        });
    };

    const calculateShipping = async (address: { street: string; city: string; state: string; zip: string }) => {
        const cost = address.zip.length * 0.5 // Simulação
        setShippingCost(cost)
    }

    useEffect(() => {
        document.addEventListener("mousedown", handleClickOutside)
        return () => {
            document.removeEventListener("mousedown", handleClickOutside)
        }
    }, [])

    return (
        <CartContext.Provider
            value={{
                cart: cart || [], // Fallback para evitar undefined
                addToCart,
                removeFromCart,
                completePurchase: handleCompletePurchase,
                isCartOpen,
                setIsCartOpen,
                address,
                setAddress,
                shippingCost,
                calculateShipping,
                total,
                setCart,
            }}
        >
            {children}
        </CartContext.Provider>
    );
};

// Hook para consumir o contexto
export const useCart = () => {
    const context = useContext(CartContext)
    if (!context) {
        throw new Error("useCart must be used within a CartProvider")
    }
    return context
}

