import React, { useState, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { applyCoupon, createCashOrderForUser, emptyUserCart, getUserCart, saveUserAddress } from "../functions/user";
import { ADDTO_CART } from "../reducers/cartReducer";
import { toast } from "react-toastify";
import ReactQuill from "react-quill";
import "react-quill/dist/quill.snow.css";
import { COUPON_APPLIED } from "../reducers/couponReducer";
import { useNavigate } from "react-router";
import { CODTYPE } from "../reducers/CODReducer";

export const Checkout = () => {

    const [products, setProducts] = useState([]);
    const [total, setTotal] = useState(0);
    const [address, setAddress] = useState("");
    const [addressSaved, setAddressSaved] = useState(false);
    const [coupon, setCoupon] = useState("");
    // discount price
    const [totalAfterDiscount, setTotalAfterDiscount] = useState(0);
    const [discountError, setDiscountError] = useState("");

    const { user, COD, coupon: couponTrueOrFalse } = useSelector((state) => ({ ...state }));
    const dispatch = useDispatch();
    const navigate = useNavigate();
    useEffect(() => {
        if (user && user.token) {
            getUserCart(user.token)
                .then((res) => {
                    // console.log('user cart res', JSON.stringify(res.data, null, 4));
                    setProducts(res.data.products);
                    setTotal(res.data.cartTotal);

                })
        }
    }, []);

    const saveAddressToDb = () => {
        // console.log(address);
        saveUserAddress(user.token, address).then(res => {
            if (res.data.ok) {
                setAddressSaved(true);
                toast.success("Address saved");
            }
        })
    }

    const emptyCart = () => {
        if (typeof window !== window) {
            localStorage.removeItem("cart");
        }

        // remove from redux
        dispatch({
            type: ADDTO_CART,
            payload: [],
        });
        // remove from backend
        emptyUserCart(user.token)
            .then(res => {
                setProducts([]);
                setTotal(0);
                setTotalAfterDiscount(0);
                setCoupon("");
                toast.info("Cart is empty. Continue shopping. ")
            })
    }

    const applyDiscountCoupon = () => {
        console.log("appply dicount coupon", coupon);
        // applyCoupon
        applyCoupon(user.token, coupon).then((res) => {
            console.log("res on coupon applied", res.data);
            if (res.data) {
                setTotalAfterDiscount(res.data);
                // update redux coupon applied true or fasle;
                dispatch({
                    type: COUPON_APPLIED,
                    payload: true,
                })
            }
            // error
            if (res.data.err) {
                setDiscountError(res.data.err);
                // update redux coupon applied true/false
                dispatch({
                    type: COUPON_APPLIED,
                    payload: false,
                })
            }
        })

    }

    const showAddress = () =>
        <>
            <ReactQuill
                theme="snow"
                value={address}
                onChange={setAddress} />
            <button
                className="btn btn-primary mt-2"
                onClick={saveAddressToDb}
            >Save</button>
        </>

    const showProductSummary = () =>
        products.map((p, i) => (
            <div key={i}>
                <p>{p.product.title} ({p.color}) x {p.count} = {p.product.price * p.count}</p>
            </div>
        ));

    const showApplyCoupon = () =>
        <>
            <input
                onChange={e => {
                    setCoupon(e.target.value);
                    setDiscountError("");
                }}
                type="text"
                value={coupon}
                className="form-control"
            />
            <button
                onClick={applyDiscountCoupon}
                className="btn btn-primary mt-2">Apply</button>
        </>

    const createCashOrder = () => {
        createCashOrderForUser(user.token, COD, couponTrueOrFalse).then(res => {
            console.log("User cash order created response", res)
            // empty cart from redux, localStorage, reset coupon, reset COD, redirect
            if (res.data.ok) {

                // empty localstorage
                if (typeof window !== "undefined") localStorage.removeItem("cart");
                // empty redux cart
                dispatch({
                    type: ADDTO_CART,
                    payload: [],
                });

                // empty coupon
                dispatch({
                    type: COUPON_APPLIED,
                    payload: false
                });

                // empty redux COD
                dispatch({
                    type: CODTYPE,
                    payload: false
                });

                // empty cart from backend
                emptyUserCart(user.token);

                // redirect
                setTimeout(() => {
                    navigate("/user/history");
                }, 1000)
            }
        })
    }
    return (
        <div className="row">
            <div className="col-md-6">
                <h4>Delivery Address</h4>
                <br />
                <br />
                {showAddress()}
                <hr />
                <h4>Got Coupon?</h4>
                <br />
                {showApplyCoupon()}
                <br />
                {discountError && <p className="bg-danger p-2">{discountError}</p>}
                coupon input and apply button
            </div>
            <div className="col-md-6">
                <h4>Order Summary</h4>
                <hr />
                <p>Products {products.length}</p>
                <hr />
                {showProductSummary()}
                <hr />
                <p>Cart Total: {total}</p>
                {totalAfterDiscount > 0 && (
                    <p className="bg-success p-2">
                        Discount Applied: Total Payable: ${totalAfterDiscount}
                    </p>
                )}

                <div className="row">
                    <div className="col-md-6">
                        {COD ? (
                            <button
                                disabled={!addressSaved || !products.length}
                                className="btn btn-primary"
                                onClick={createCashOrder}
                            >
                                Place Order</button>
                        ) : (
                            <button
                                disabled={!addressSaved || !products.length}
                                className="btn btn-primary"
                                onClick={() => navigate("/payment")}
                            >
                                Place Order</button>
                        )}
                    </div>
                    <div className="col-md-6">
                        <button disabled={!products.length} onClick={emptyCart} className="btn btn-primary">Empty Cart</button>
                    </div>
                </div>
            </div>
        </div>
    )
}