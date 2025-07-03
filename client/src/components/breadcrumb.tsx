"use client";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import React from "react";

const capitalizeSegment = (segment: string) => {
  return segment.charAt(0).toUpperCase() + segment.slice(1);
};
const BreadCrumb = () => {
  const pathname = window.location.pathname;
  const pathSegments = pathname.split("/").filter((segment) => segment);

  return (
    <Breadcrumb className="p-4">
      <BreadcrumbList>
        {pathSegments.map((segment, index) => {
          const href = `/${pathSegments.slice(0, index + 1).join("/")}`;
          const isNotLast = index < pathSegments.length - 1;
          return (
            <React.Fragment key={index}>
              <BreadcrumbItem>
                <BreadcrumbLink href={href}>
                  {isNotLast ? (
                    capitalizeSegment(segment)
                  ) : (
                    <strong>
                      {" "}
                      <BreadcrumbPage>
                        {capitalizeSegment(segment)}
                      </BreadcrumbPage>
                    </strong>
                  )}
                </BreadcrumbLink>
              </BreadcrumbItem>
              {isNotLast && <BreadcrumbSeparator />}
            </React.Fragment>
          );
        })}
      </BreadcrumbList>
    </Breadcrumb>
  );
};

export default BreadCrumb;

BreadCrumb.displayName = "BreadCrumb";
