import { NextResponse } from "next/server";
import { ZodError } from "zod";

export function jsonOk(data = {}, init = {}) {
  return NextResponse.json(data, init);
}

export function jsonError(message, status = 400, details = null) {
  console.error("[api]", message, details ?? "");
  return NextResponse.json(
    {
      error: message,
      details,
    },
    {
      status,
    },
  );
}

export function validationError(error) {
  console.error("[api] validation", error);
  const issues = error instanceof ZodError ? error.issues : error?.issues;

  if (Array.isArray(issues) && issues.length > 0) {
    const details = issues.map((issue) => ({
      field: Array.isArray(issue.path) ? issue.path.join(".") : "",
      message: issue.message,
    }));
    const message =
      details.length === 1
        ? details[0].message
        : "Please check the highlighted fields.";

    return NextResponse.json(
      {
        error: message,
        details,
      },
      {
        status: 422,
      },
    );
  }

  if (error instanceof Error && error.message) {
    return NextResponse.json(
      {
        error: error.message,
        details: null,
      },
      {
        status: 422,
      },
    );
  }

  return NextResponse.json(
    {
      error: "The request could not be validated.",
      details: null,
    },
    {
      status: 422,
    },
  );
}
