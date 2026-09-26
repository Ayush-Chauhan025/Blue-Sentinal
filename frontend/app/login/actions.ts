"use server"
import { prisma } from "@/lib/prisma";
import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import * as z from "zod"


const User = z.object({
    email: z.email(),
    password: z.string().min(8)
});

export async function SignIn(formData: FormData){
    console.log(formData);
    const email = formData.get('email') as string
    const password= formData.get('password') as string
    const supabase = await createClient();

    const user = {
        email,
        password
    }

    if (!email || !password) {
        return { error: 'Email and password are required.' };
    }

    const valid = User.safeParse(user);
    if(!valid.success){
        return { error: "Invalid Email or Password" };
    }

    const {data, error} = await supabase.auth.signInWithPassword({
        email,
        password
    });

    if (error) {
        return { error: error.message }
    }
    let route = '/maps';
    try{
        const id = data.user!.id;
        const result = await prisma.user.findUnique({
            where: {
                id
            },
            select: { role: true }
        });

        if(!result) {
            return { error: "Can't get user." };
        }

        const type = result.role;
        if(type === 'ADMIN'){
            route = '/dashboard';
        }
    } catch (err){
        console.log(err);
        return { error: "Can't get user." };
    }
    redirect(route);
}

export async function SignUp(formData: FormData){
    console.log(formData);
    const email = formData.get('email') as string
    const password= formData.get('password') as string
    const supabase = await createClient();

    const user = {
        email,
        password
    }

    if (!email || !password) {
        return { error: 'Email and password are required.' };
    }

    const valid = User.safeParse(user);
    if(!valid.success){
        return { error: "Invalid Email or Password" };
    }
    console.log("valid user")
    const {error} = await supabase.auth.signUp({
        email,
        password
    });
    console.log(".auth.signup");
    console.log(error);

    if (error) {
        return { error: error.message }
    }

    redirect('/maps');
}

export async function SignOut() {
    const supabase = await createClient();
    await supabase.auth.signOut();
    redirect('/login');
}