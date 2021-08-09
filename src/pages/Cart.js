import React from "react";
import { useDispatch, useSelector } from "react-redux"
import { Link, useNavigate } from "react-router-dom";
import { ProductCardInCheckout } from "../components/cards/ProductCardInCheckout";
import { userCart } from "../functions/user";
import { CODTYPE } from "../reducers/CODReducer";

export const Cart = () => {

    const { cart, user } = useSelector((state) => ({ ...state }));
    const dispatch = useDispatch();
    const navigate = useNavigate();

    const getTotal = () => {
        return cart.reduce((currentValue, nextValue) => {
            return currentValue + nextValue.count * nextValue.price;
        }, 0);
    }

    const saveOrderToDb = () => {
        // console.log("cart", JSON.stringify(cart, null, 4));
        userCart(cart, user.token)
            .then(res => {
                console.log('cart post res', res)
                if (res.data.ok) navigate("/checkout");
            }).catch((err) => console.log("cart save err", err));
    }

    const saveCashOrderToDb = () => {
        // console.log("cart", JSON.stringify(cart, null, 4));
        dispatch({
            type: CODTYPE,
            payload: true
        });

        userCart(cart, user.token)
            .then(res => {
                console.log('cart post res', res)
                if (res.data.ok) navigate("/checkout");
            }).catch((err) => console.log("cart save err", err));
    }

    const showCartItems = () => (
        <table className="table table-bordered">
            <thead className="thead-light">
                <tr>
                    <th scope="col">Image</th>
                    <th scope="col">Title</th>
                    <th scope="col">Price</th>
                    <th scope="col">Brand</th>
                    <th scope="col">Color</th>
                    <th scope="col">Count</th>
                    <th scope="col">Shipping</th>
                    <th scope="col">Remove</th>
                </tr>
            </thead>
            {cart.map((p) => (
                <ProductCardInCheckout key={p._id} p={p} />
            ))}
        </table>
    )

    return (
        <div className="container-fluid pt-2">
            <div className="row">
                <div className="col-md-8">
                    <h4>Cart / {cart.length}Product</h4>
                    {!cart.length ? (
                        <p>No products in cart. <Link to="/shop">Countinue shopping</Link></p>
                    ) : (
                        showCartItems()
                    )}
                </div>
                <div className="col-md-4">
                    <h4>Order summary</h4>
                    <hr />
                    <p>Products</p>
                    {cart.map((c, i) =>
                        <div key={i}>
                            <p>{c.title} x {c.count} = ${c.price * c.count}</p>
                        </div>
                    )}
                    <hr />
                    Total: <b>${getTotal()}</b>
                    <hr />
                    {
                        user ? (
                            <>
                                <button
                                    disabled={!cart.length}
                                    onClick={saveOrderToDb}
                                    className="btn btn-sm btn-primary mt-2"
                                >Proceed to Checkout</button>
                                <br />
                                <button
                                    disabled={!cart.length}
                                    onClick={saveCashOrderToDb}
                                    className="btn btn-sm btn-warning mt-2"
                                >Pay Cash on Delivery</button>
                            </>
                        ) : (
                            <button
                                className="btn btn-sm btn-primary mt-2">
                                <button
                                    style={{ background: 'node', border: '0px', cursor: "pointer" }}
                                    onClick={() =>
                                        navigate({ pathname: '/login' }, { state: { from: `/cart` } })
                                    }>Login to Checkout</button></button>
                        )
                    }
                </div>
            </div>
        </div>
    )
}