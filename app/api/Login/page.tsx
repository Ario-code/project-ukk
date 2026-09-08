"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { headers } from "next/dist/server/request/headers";

export default function LoginPage() {

    const router = useRouter();
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    
    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        
        try {
            const response = await fetch("/api/auth/Login", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({ email, password })
            });

            const data = await response.json();
            if (!response.ok) {
                alert(data.message);
                return;
            }

            switch (data.user.role) {
                case "ADMIN":
                    router.push("/admin");
                    break;
                case "GURU":
                    router.push("/guru");
                    break;
                case "MURID":
                    router.push("/murid");
                    break;
                case "WAKAKURIKULUM":
                    router.push("/wakakur");
                    break;
                case "KEPSEK":
                    router.push("/kepsek");
                    break;
                default:
                    alert("Role tidak dikenali");
            }
        } catch (error) {
            console.error("Error logging in:", error);
        }
    }

    return (
        <main>
            
        </main>
    )
}