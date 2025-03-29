"use client";

import { z } from "zod";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { SubmitHandler, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import slugify from "slugify";

import { useToast } from "@/hooks/use-toast";
import { Product } from "@/types";
import { productSchema, updateProductSchema } from "@/lib/validator";
import { createProduct, updateProduct } from "@/lib/actions/product.actions";
import { UploadButton } from "@/lib/uploadThing";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";

const ProductForm = ({
  type,
  product,
  productId,
}: {
  type: "create" | "update";
  product?: Product;
  productId?: string;
}) => {
  const router = useRouter();
  const { toast } = useToast();

  const form = useForm<z.infer<typeof productSchema>>({
    resolver:
      type === "update"
        ? zodResolver(updateProductSchema)
        : zodResolver(productSchema),
    defaultValues: product || {
      name: "",
      slug: "",
      category: "",
      images: [],
      brand: "",
      description: "",
      price: "0",
      stock: 0,
      isFeatured: false,
      banner: null,
    },
  });

  const images = form.watch("images");
  const isFeatured = form.watch("isFeatured");
  const banner = form.watch("banner");

  const onSubmit: SubmitHandler<z.infer<typeof productSchema>> = async (
    values
  ) => {
    if (type === "create") {
      const res = await createProduct(values);

      if (!res.success) {
        toast({
          variant: "destructive",
          description: res.message,
        });
      } else {
        toast({
          description: res.message,
        });
        router.push("/admin/products");
      }
    }

    if (type === "update" && productId) {
      const res = await updateProduct({ ...values, id: productId });

      if (!res.success) {
        toast({
          variant: "destructive",
          description: res.message,
        });
      } else {
        toast({
          description: res.message,
        });
        router.push("/admin/products");
      }
    }
  };

  return (
    <Form {...form}>
      <form
        className="space-y-8"
        method="POST"
        onSubmit={form.handleSubmit(onSubmit)}
      >
        <div className="flex flex-col md:flex-row gap-5">
          <FormField
            control={form.control}
            name="name"
            render={({ field }) => (
              <FormItem className="w-full">
                <FormLabel>Name</FormLabel>
                <FormControl>
                  <Input placeholder="Enter product name" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="slug"
            render={({ field }) => (
              <FormItem className="w-full">
                <FormLabel>Slug</FormLabel>
                <FormControl>
                  <div className="relative">
                    <Input placeholder="Enter product slug" {...field} />
                    <Button
                      type="button"
                      className="bg-gray-500 hover:bg-gray-600 text-white px-4 py-1 mt-2"
                      onClick={() =>
                        form.setValue(
                          "slug",
                          slugify(form.getValues("name"), { lower: true })
                        )
                      }
                    >
                      Generate
                    </Button>
                  </div>
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>
        <div className="flex flex-col md:flex-row gap-5">
          <FormField
            control={form.control}
            name="category"
            render={({ field }) => (
              <FormItem className="w-full">
                <FormLabel>Category</FormLabel>
                <FormControl>
                  <Input placeholder="Enter product category" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="brand"
            render={({ field }) => (
              <FormItem className="w-full">
                <FormLabel>Brand</FormLabel>
                <FormControl>
                  <Input placeholder="Enter brand name" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>
        <div className="flex flex-col md:flex-row gap-5">
          <FormField
            control={form.control}
            name="price"
            render={({ field }) => (
              <FormItem className="w-full">
                <FormLabel>Price</FormLabel>
                <FormControl>
                  <Input
                    type="number"
                    placeholder="Enter product price"
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="stock"
            render={({ field }) => (
              <FormItem className="w-full">
                <FormLabel>Stock</FormLabel>
                <FormControl>
                  <Input
                    type="number"
                    placeholder="Enter product stock"
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>
        <div className="upload-field flex flex-col md:flex-row gap-5">
          <FormField
            control={form.control}
            name="images"
            render={() => (
              <FormItem className="w-full">
                <FormLabel>Images</FormLabel>
                <Card>
                  <CardContent className="space-y-2 mt-2 min-h-48 flex justify-center items-center">
                    <div className="flex-start flex-col space-y-2">
                      <div className="flex gap-2 flex-wrap">
                        {(images || []).map((image) => (
                          <Image
                            key={image}
                            src={image}
                            width={100}
                            height={100}
                            alt="product image"
                            className="w-20 h-20 objet-cover object-center rounded-small"
                          />
                        ))}
                      </div>

                      <FormControl>
                        <UploadButton
                          endpoint="imageUploader"
                          onClientUploadComplete={(res) => {
                            form.setValue("images", [...images, res[0].ufsUrl]);
                          }}
                          onUploadError={(error) => {
                            toast({
                              variant: "destructive",
                              description: `Error ${error}`,
                            });
                          }}
                        />
                      </FormControl>
                    </div>
                  </CardContent>
                </Card>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>
        <div className="upload-field">
          Featured Product
          <Card>
            <CardContent className="space-y-2 mt-2">
              <FormField
                control={form.control}
                name="isFeatured"
                render={({ field }) => (
                  <FormItem className="space-x-2 items-center">
                    <FormControl>
                      <Checkbox
                        checked={field.value}
                        onCheckedChange={field.onChange}
                      />
                    </FormControl>
                    <FormLabel>Is featured?</FormLabel>
                  </FormItem>
                )}
              />
              {isFeatured && banner ? (
                <Image
                  src={banner}
                  alt="product banner"
                  className="w-full object-cover object-center rounded-sm"
                  width={1920}
                  height={680}
                />
              ) : (
                <></>
              )}

              {isFeatured && !banner ? (
                <UploadButton
                  endpoint="imageUploader"
                  onClientUploadComplete={(res) => {
                    form.setValue("banner", res[0].ufsUrl);
                  }}
                  onUploadError={(error) => {
                    toast({
                      variant: "destructive",
                      description: `Error ${error}`,
                    });
                  }}
                />
              ) : (
                <></>
              )}
            </CardContent>
          </Card>
        </div>
        <div>
          <FormField
            control={form.control}
            name="description"
            render={({ field }) => (
              <FormItem className="w-full">
                <FormLabel>Description</FormLabel>
                <FormControl>
                  <Textarea
                    placeholder="Enter product description"
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>
        <div>
          <Button
            type="submit"
            size="lg"
            disabled={form.formState.isSubmitting}
            className="capitalize col-span-2 w-full"
          >
            {form.formState.isSubmitting ? "Saving..." : `${type} product`}
          </Button>
        </div>
      </form>
    </Form>
  );
};
export default ProductForm;
