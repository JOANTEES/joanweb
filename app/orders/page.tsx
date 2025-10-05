"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import Navigation from "../components/Navigation";
import { useAuth } from "../contexts/AuthContext";
import {
  Package,
  Clock,
  CheckCircle,
  XCircle,
  Truck,
  Store,
  MapPin,
  ImageIcon,
} from "lucide-react";

export default function Orders() {
  const { isAuthenticated, loading, setRedirectUrl } = useAuth();
  const router = useRouter();
  const [orders, setOrders] = useState<
    Array<{
      id: string;
      orderNumber: string;
      status: string;
      paymentMethod: string;
      paymentStatus: string;
      deliveryMethod: string;
      totals: {
        subtotal: number;
        taxAmount: number;
        shippingFee: number;
        largeOrderFee: number;
        specialDeliveryFee: number;
        totalAmount: number;
      };
      createdAt: string;
    }>
  >([]);
  const [_fetching, setFetching] = useState<boolean>(true); // eslint-disable-line @typescript-eslint/no-unused-vars
  const [_error, setError] = useState<string | null>(null); // eslint-disable-line @typescript-eslint/no-unused-vars
  const API_BASE_URL =
    process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api";

  // Order details modal state
  const [detailsOpen, setDetailsOpen] = useState(false);
  const [detailsLoading, setDetailsLoading] = useState(false);
  const [selectedOrderId, setSelectedOrderId] = useState<string | null>(null); // eslint-disable-line @typescript-eslint/no-unused-vars
  const [orderDetails, setOrderDetails] = useState<null | {
    id: string;
    orderNumber: string;
    status: string;
    paymentMethod: string;
    paymentStatus: string;
    deliveryMethod: string;
    deliveryAddress: {
      regionId?: number;
      cityId?: number;
      areaName?: string;
      landmark?: string | null;
      additionalInstructions?: string | null;
      contactPhone?: string | null;
      regionName?: string;
      cityName?: string;
      googleMapsLink?: string;
    } | null;
    pickupLocation: { id?: string; name?: string } | null;
    deliveryZone?: { id: string; name: string; deliveryFee: number } | null;
    totals: {
      subtotal: number;
      taxAmount: number;
      shippingFee: number;
      largeOrderFee: number;
      specialDeliveryFee: number;
      totalAmount: number;
    };
    customerNotes?: string | null;
    items?: Array<{
      id: string;
      productId: string;
      productName: string;
      productDescription?: string;
      productImageUrl?: string;
      size?: string | null;
      color?: string | null;
      quantity: number;
      unitPrice: number;
      subtotal: number;
      currentProductName?: string;
      currentImageUrl?: string;
    }>;
  }>(null);

  const openDetails = async (orderId: string) => {
    setSelectedOrderId(orderId);
    setDetailsOpen(true);
    setDetailsLoading(true);
    try {
      const res = await fetch(`${API_BASE_URL}/orders/${orderId}`, {
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${
            typeof window !== "undefined"
              ? localStorage.getItem("authToken")
              : ""
          }`,
          "Cache-Control": "no-cache, no-store, must-revalidate",
          Pragma: "no-cache",
          Expires: "0",
        },
      });
      const ct = res.headers.get("content-type") || "";
      const data = ct.includes("application/json")
        ? await res.json()
        : { success: false, message: await res.text() };
      if (!res.ok || !data.success)
        throw new Error(data.message || "Failed to fetch order details");
      setOrderDetails(data.order || null);
    } catch {
      setOrderDetails(null);
    } finally {
      setDetailsLoading(false);
    }
  };

  useEffect(() => {
    if (!loading && !isAuthenticated) {
      // Store current URL for redirect after login with account context
      setRedirectUrl("/orders", "account");
      router.push("/login");
    }
  }, [isAuthenticated, loading, router, setRedirectUrl]);

  useEffect(() => {
    const fetchOrders = async () => {
      if (!isAuthenticated) return;
      setFetching(true);
      setError(null);
      try {
        const res = await fetch(`${API_BASE_URL}/orders`, {
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${
              typeof window !== "undefined"
                ? localStorage.getItem("authToken")
                : ""
            }`,
            "Cache-Control": "no-cache, no-store, must-revalidate",
            Pragma: "no-cache",
            Expires: "0",
          },
        });
        const contentType = res.headers.get("content-type") || "";
        const data = contentType.includes("application/json")
          ? await res.json()
          : { success: false, message: await res.text() };
        if (!res.ok || !data.success) {
          throw new Error(data.message || "Failed to fetch orders");
        }
        setOrders(
          Array.isArray(data.orders)
            ? (data.orders as Array<{
                id: string;
                orderNumber: string;
                status: string;
                paymentMethod: string;
                paymentStatus: string;
                deliveryMethod: string;
                totals: {
                  subtotal: number;
                  taxAmount: number;
                  shippingFee: number;
                  largeOrderFee: number;
                  specialDeliveryFee: number;
                  totalAmount: number;
                };
                createdAt: string;
              }>)
            : []
        );
      } catch (e) {
        setError(e instanceof Error ? e.message : "Failed to fetch orders");
        setOrders([]);
      } finally {
        setFetching(false);
      }
    };
    fetchOrders();
  }, [API_BASE_URL, isAuthenticated]);

  // Normalize orders for rendering (must be before any early returns to keep hook order consistent)
  const normalizedOrders = useMemo(() => {
    return orders.map((o) => ({
      orderId: o.id,
      orderNumber: o.orderNumber,
      date:
        o.createdAt ||
        (o as { created_at?: string; date?: string }).created_at ||
        (o as { created_at?: string; date?: string }).date,
      status: o.status || "pending",
      paymentStatus: o.paymentStatus || "pending",
      paymentMethod: o.paymentMethod || "online",
      total:
        o.totals?.totalAmount ??
        (o as { totalAmount?: number; total?: number }).totalAmount ??
        (o as { totalAmount?: number; total?: number }).total ??
        0,
      items: (
        (
          o as {
            items?: Array<{
              productName?: string;
              name?: string;
              unitPrice?: number;
              price?: number;
              quantity?: number;
            }>;
          }
        ).items || []
      ).map(
        (it: {
          productName?: string;
          name?: string;
          unitPrice?: number;
          price?: number;
          quantity?: number;
        }) => ({
          name: it.productName || it.name,
          price: it.unitPrice ?? it.price ?? 0,
          quantity: it.quantity ?? 1,
        })
      ),
    }));
  }, [orders]);

  if (loading) {
    return (
      <>
        <Navigation />
        <div className="min-h-screen bg-black flex items-center justify-center">
          <div className="text-white text-xl">Loading...</div>
        </div>
      </>
    );
  }

  if (!isAuthenticated) {
    return null;
  }

  const getStatusText = (status: string) => {
    switch (status) {
      case "completed":
        return "Completed";
      case "delivered":
        return "Delivered";
      case "shipped":
        return "Shipped";
      case "processing":
        return "Processing";
      case "pending":
        return "Pending";
      case "confirmed":
        return "Confirmed";
      case "ready_for_pickup":
        return "Ready for Pickup";
      case "out_for_delivery":
        return "Out for Delivery";
      default:
        return status
          ? status.charAt(0).toUpperCase() +
              status.slice(1).replaceAll("_", " ")
          : "Unknown";
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "completed":
        return "text-green-400 bg-green-400/10 border-green-400/20";
      case "delivered":
        return "text-green-400 bg-green-400/10 border-green-400/20";
      case "shipped":
        return "text-blue-400 bg-blue-400/10 border-blue-400/20";
      case "processing":
        return "text-yellow-400 bg-yellow-400/10 border-yellow-400/20";
      case "pending":
        return "text-yellow-400 bg-yellow-400/10 border-yellow-400/20";
      case "confirmed":
        return "text-blue-300 bg-blue-300/10 border-blue-300/20";
      case "ready_for_pickup":
        return "text-purple-300 bg-purple-300/10 border-purple-300/20";
      case "out_for_delivery":
        return "text-teal-300 bg-teal-300/10 border-teal-300/20";
      case "refunded":
        return "text-orange-300 bg-orange-300/10 border-orange-300/20";
      case "cancelled":
        return "text-red-400 bg-red-400/10 border-red-400/20";
      default:
        return "text-gray-300 bg-gray-300/10 border-gray-300/20";
    }
  };

  // Enhanced status function that considers both order status and payment status
  const getEnhancedStatus = (orderStatus: string) => {
    // Business rule: show the real order status from backend (e.g., pending until admin confirms)
    return orderStatus || "pending";
  };

  const getEnhancedStatusIcon = (status: string) => {
    switch (status) {
      case "completed":
        return <CheckCircle className="w-5 h-5 text-green-400" />;
      case "delivered":
        return <CheckCircle className="w-5 h-5 text-green-400" />;
      case "shipped":
        return <Package className="w-5 h-5 text-blue-400" />;
      case "processing":
        return <Clock className="w-5 h-5 text-yellow-400" />;
      case "pending":
        return <Clock className="w-5 h-5 text-yellow-400" />;
      default:
        return <XCircle className="w-5 h-5 text-red-400" />;
    }
  };

  const getEnhancedStatusText = (status: string) => {
    switch (status) {
      case "completed":
        return "Completed";
      case "delivered":
        return "Delivered";
      case "shipped":
        return "Shipped";
      case "processing":
        return "Processing";
      case "pending":
        return "Pending";
      case "confirmed":
        return "Confirmed";
      case "ready_for_pickup":
        return "Ready for Pickup";
      case "out_for_delivery":
        return "Out for Delivery";
      default:
        return status
          ? status.charAt(0).toUpperCase() +
              status.slice(1).replaceAll("_", " ")
          : "Unknown";
    }
  };

  const getEnhancedStatusColor = (status: string) => {
    switch (status) {
      case "completed":
        return "text-green-400 bg-green-400/10 border-green-400/20";
      case "delivered":
        return "text-green-400 bg-green-400/10 border-green-400/20";
      case "shipped":
        return "text-blue-400 bg-blue-400/10 border-blue-400/20";
      case "processing":
        return "text-yellow-400 bg-yellow-400/10 border-yellow-400/20";
      case "pending":
        return "text-yellow-400 bg-yellow-400/10 border-yellow-400/20";
      case "confirmed":
        return "text-blue-300 bg-blue-300/10 border-blue-300/20";
      case "ready_for_pickup":
        return "text-purple-300 bg-purple-300/10 border-purple-300/20";
      case "out_for_delivery":
        return "text-teal-300 bg-teal-300/10 border-teal-300/20";
      case "refunded":
        return "text-orange-300 bg-orange-300/10 border-orange-300/20";
      case "cancelled":
        return "text-red-400 bg-red-400/10 border-red-400/20";
      default:
        return "text-gray-300 bg-gray-300/10 border-gray-300/20";
    }
  };

  return (
    <>
      <Navigation />

      {/* Hero Section */}
      <section className="bg-gradient-to-r from-gray-900 to-black py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h1 className="text-4xl lg:text-6xl font-bold text-white mb-4">
              Your <span className="text-yellow-400">Orders</span>
            </h1>
            <p className="text-xl text-gray-300 max-w-2xl mx-auto">
              Track and manage all your orders in one place.
            </p>
          </div>
        </div>
      </section>

      {/* Orders Section */}
      <section className="py-16 bg-black">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          {orders.length === 0 ? (
            <div className="text-center py-16">
              <Package className="w-16 h-16 text-gray-600 mx-auto mb-4" />
              <h3 className="text-2xl font-bold text-white mb-2">
                No Orders Yet
              </h3>
              <p className="text-gray-400 mb-8">
                Start shopping to see your orders here.
              </p>
              <a
                href="/shop"
                className="bg-yellow-400 hover:bg-yellow-500 text-black px-8 py-3 rounded-full font-semibold transition-colors duration-200"
              >
                Start Shopping
              </a>
            </div>
          ) : (
            <div className="space-y-6">
              {normalizedOrders.map((order) => (
                <div
                  key={order.orderId}
                  className="bg-gray-800 rounded-2xl p-6 border border-gray-700"
                >
                  <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-4">
                    <div>
                      <h3 className="text-xl font-bold text-white">
                        Order #{order.orderNumber}
                      </h3>
                      <p className="text-gray-400">
                        Placed on{" "}
                        {order.date
                          ? new Date(order.date).toLocaleDateString()
                          : "Unknown date"}
                      </p>
                    </div>
                    <div className="flex items-center space-x-4 mt-4 md:mt-0">
                      <div
                        className={`flex items-center space-x-2 px-3 py-1 rounded-full border ${getEnhancedStatusColor(
                          getEnhancedStatus(order.status)
                        )}`}
                      >
                        {getEnhancedStatusIcon(getEnhancedStatus(order.status))}
                        <span className="font-medium">
                          {getEnhancedStatusText(
                            getEnhancedStatus(order.status)
                          )}
                        </span>
                      </div>
                      <div className="text-right">
                        <p className="text-2xl font-bold text-white">
                          ₵{order.total}
                        </p>
                        <p className="text-sm text-gray-400">Total</p>
                      </div>
                    </div>
                  </div>

                  <div className="border-t border-gray-700 pt-4">
                    <h4 className="text-lg font-semibold text-white mb-3">
                      Items
                    </h4>
                    <div className="space-y-2">
                      {(order.items ?? []).map((item, index) => (
                        <div
                          key={index}
                          className="flex justify-between items-center py-2"
                        >
                          <div>
                            <p className="text-white font-medium">
                              {item.name}
                            </p>
                            <p className="text-gray-400 text-sm">
                              Quantity: {item.quantity}
                            </p>
                          </div>
                          <p className="text-white font-semibold">
                            ₵{item.price}
                          </p>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="flex flex-col sm:flex-row gap-3 mt-6">
                    <button
                      onClick={() => openDetails(order.orderId)}
                      className="flex-1 bg-gray-700 hover:bg-gray-600 text-white py-3 rounded-lg font-medium transition-colors duration-200"
                    >
                      View Details
                    </button>
                    {order.status === "delivered" && (
                      <button className="flex-1 bg-yellow-400 hover:bg-yellow-500 text-black py-3 rounded-lg font-medium transition-colors duration-200">
                        Reorder
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* Order Details Modal */}
      {detailsOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          <div
            className="absolute inset-0 bg-black/70"
            onClick={() => setDetailsOpen(false)}
          />
          <div className="relative z-10 w-full max-w-2xl bg-gray-900 rounded-xl p-6 border border-gray-700 shadow-2xl max-h-[85vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-xl font-semibold text-white">
                Order Details
              </h3>
              <button
                onClick={() => setDetailsOpen(false)}
                className="text-gray-400 hover:text-white"
                aria-label="Close"
              >
                ✕
              </button>
            </div>

            {detailsLoading ? (
              <div className="text-gray-400">Loading details...</div>
            ) : !orderDetails ? (
              <div className="text-red-400">Failed to load order details.</div>
            ) : (
              <div className="space-y-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-gray-400 text-sm">Order</p>
                    <p className="text-white font-medium">
                      #{orderDetails.orderNumber || orderDetails.id}
                    </p>
                  </div>
                  <div
                    className={`px-3 py-1 rounded-full border ${getStatusColor(
                      orderDetails.status
                    )}`}
                  >
                    <span className="text-sm font-medium">
                      {getStatusText(orderDetails.status)}
                    </span>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="bg-gray-800/60 rounded-lg p-4">
                    <div className="flex items-center mb-2 text-white font-medium">
                      {orderDetails.deliveryMethod === "pickup" ? (
                        <Store className="w-4 h-4 mr-2 text-green-400" />
                      ) : (
                        <Truck className="w-4 h-4 mr-2 text-blue-400" />
                      )}
                      {orderDetails.deliveryMethod === "pickup"
                        ? "Pickup Details"
                        : "Delivery Details"}
                    </div>
                    {orderDetails.deliveryMethod === "pickup" ? (
                      <div className="text-gray-300 text-sm">
                        <p>
                          {orderDetails.pickupLocation?.name ||
                            "Pickup location"}
                        </p>
                      </div>
                    ) : (
                      <div className="text-gray-300 text-sm space-y-1">
                        <div className="flex items-center">
                          <MapPin className="w-4 h-4 mr-2 text-gray-400" />
                          <span>
                            {orderDetails.deliveryAddress?.areaName},{" "}
                            {orderDetails.deliveryAddress?.cityName}
                          </span>
                        </div>
                        <p>{orderDetails.deliveryAddress?.regionName}</p>
                        {orderDetails.deliveryAddress?.landmark && (
                          <p>Near {orderDetails.deliveryAddress.landmark}</p>
                        )}
                        {orderDetails.deliveryAddress?.contactPhone && (
                          <p>
                            Phone: {orderDetails.deliveryAddress.contactPhone}
                          </p>
                        )}
                        {orderDetails.deliveryAddress?.googleMapsLink && (
                          <a
                            className="text-yellow-400 text-xs"
                            href={orderDetails.deliveryAddress.googleMapsLink}
                            target="_blank"
                            rel="noreferrer"
                          >
                            Open in Maps
                          </a>
                        )}
                      </div>
                    )}
                  </div>

                  <div className="bg-gray-800/60 rounded-lg p-4">
                    <div className="text-white font-medium mb-2">Totals</div>
                    <div className="text-gray-300 text-sm space-y-1">
                      <div className="flex justify-between">
                        <span>Subtotal</span>
                        <span>₵{orderDetails.totals.subtotal.toFixed(2)}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Tax</span>
                        <span>₵{orderDetails.totals.taxAmount.toFixed(2)}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Delivery</span>
                        <span>
                          ₵{orderDetails.totals.shippingFee.toFixed(2)}
                        </span>
                      </div>
                      {orderDetails.totals.largeOrderFee > 0 && (
                        <div className="flex justify-between">
                          <span>Large Order Fee</span>
                          <span>
                            ₵{orderDetails.totals.largeOrderFee.toFixed(2)}
                          </span>
                        </div>
                      )}
                      {orderDetails.totals.specialDeliveryFee > 0 && (
                        <div className="flex justify-between">
                          <span>Special Delivery Fee</span>
                          <span>
                            ₵{orderDetails.totals.specialDeliveryFee.toFixed(2)}
                          </span>
                        </div>
                      )}
                      <div className="flex justify-between font-semibold text-white pt-1 border-t border-gray-700">
                        <span>Total</span>
                        <span>
                          ₵{orderDetails.totals.totalAmount.toFixed(2)}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>

                <div>
                  <div className="text-white font-medium mb-3">Items</div>
                  <div className="space-y-3">
                    {(orderDetails.items || []).map((it) => (
                      <div
                        key={it.id}
                        className="flex items-center gap-3 bg-gray-800/50 rounded-lg p-3"
                      >
                        <div className="w-16 h-16 bg-gray-700 rounded-lg flex items-center justify-center">
                          {it.currentImageUrl || it.productImageUrl ? (
                            // eslint-disable-next-line @next/next/no-img-element
                            <img
                              src={
                                (it.currentImageUrl ||
                                  it.productImageUrl) as string
                              }
                              alt={it.productName}
                              className="w-full h-full object-cover rounded-lg"
                            />
                          ) : (
                            <ImageIcon className="w-6 h-6 text-gray-400" />
                          )}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="text-white font-medium truncate">
                            {it.productName || it.currentProductName}
                          </div>
                          <div className="text-gray-400 text-sm">
                            Qty: {it.quantity}
                          </div>
                          {(it.size || it.color) && (
                            <div className="text-gray-500 text-xs">
                              {it.size ? `Size: ${it.size}` : ""}{" "}
                              {it.color ? `Color: ${it.color}` : ""}
                            </div>
                          )}
                        </div>
                        <div className="text-white font-semibold">
                          ₵{(it.unitPrice ?? 0).toFixed(2)}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </>
  );
}
