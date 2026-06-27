package com.devteria.book.service;

import java.text.Normalizer;
import java.util.Locale;
import java.util.regex.Pattern;

/**
 * Tạo slug URL-friendly từ title sách.
 * Ví dụ: "Sapiens: Lược sử loài người" → "sapiens-luoc-su-loai-nguoi"
 */
public final class SlugUtils {

    private static final Pattern NON_LATIN = Pattern.compile("[^\\w-]");
    private static final Pattern WHITESPACE = Pattern.compile("[\\s]+");
    private static final Pattern MULTI_DASH = Pattern.compile("-+");

    private SlugUtils() {}

    public static String toSlug(String input) {
        String normalized = Normalizer.normalize(input, Normalizer.Form.NFD);
        // Bỏ dấu tiếng Việt và các ký tự đặc biệt
        String noAccents = normalized.replaceAll("\\p{InCombiningDiacriticalMarks}+", "");
        String lower = noAccents.toLowerCase(Locale.ROOT);
        String noSpecial = NON_LATIN.matcher(lower).replaceAll("-");
        String noMultiSpace = WHITESPACE.matcher(noSpecial).replaceAll("-");
        String slug = MULTI_DASH.matcher(noMultiSpace).replaceAll("-");
        // Bỏ dấu - đầu và cuối
        return slug.replaceAll("^-|-$", "");
    }
}
