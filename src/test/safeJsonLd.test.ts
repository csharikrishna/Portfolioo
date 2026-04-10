import { describe, expect, it } from "vitest";
import { safeJsonLd } from "@/lib/safeJsonLd";

describe("safeJsonLd", () => {
  it("escapes characters that can break script tags", () => {
    const payload = { text: "</script><script>alert(1)</script> & < >" };
    const output = safeJsonLd(payload);

    expect(output).toContain("\\u003c/script\\u003e");
    expect(output).toContain("\\u0026");
    expect(output).not.toContain("</script>");
  });
});
