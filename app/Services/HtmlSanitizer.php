<?php

namespace App\Services;

use DOMDocument;
use DOMElement;
use DOMNode;

/** Sanitiza o HTML do editor de páginas: allowlist de tags e atributos. */
class HtmlSanitizer
{
    private const TAGS = ['p', 'br', 'strong', 'b', 'em', 'i', 'u', 'ul', 'ol', 'li', 'h2', 'h3', 'a', 'blockquote'];

    public function clean(?string $html): string
    {
        if (! $html || trim($html) === '') {
            return '';
        }

        $doc = new DOMDocument;
        libxml_use_internal_errors(true);
        $doc->loadHTML('<?xml encoding="utf-8"?><div id="root">'.$html.'</div>', LIBXML_HTML_NOIMPLIED | LIBXML_HTML_NODEFDTD);
        libxml_clear_errors();

        $root = $doc->getElementById('root');
        $this->walk($root);

        $out = '';
        foreach ($root->childNodes as $child) {
            $out .= $doc->saveHTML($child);
        }

        return trim($out);
    }

    private function walk(DOMNode $node): void
    {
        foreach (iterator_to_array($node->childNodes) as $child) {
            if ($child instanceof DOMElement) {
                $tag = strtolower($child->tagName);
                if (in_array($tag, ['script', 'style', 'iframe', 'object', 'embed'], true)) {
                    $node->removeChild($child);

                    continue;
                }
                $this->walk($child);
                if (! in_array($tag, self::TAGS, true)) {
                    // desembrulha: mantém o texto, remove a tag
                    while ($child->firstChild) {
                        $node->insertBefore($child->firstChild, $child);
                    }
                    $node->removeChild($child);

                    continue;
                }
                foreach (iterator_to_array($child->attributes) as $attr) {
                    $keep = $tag === 'a' && $attr->name === 'href'
                        && preg_match('#^(https?://|mailto:|tel:|/)#i', trim($attr->value));
                    if (! $keep) {
                        $child->removeAttribute($attr->name);
                    }
                }
                if ($tag === 'a') {
                    $child->setAttribute('rel', 'noopener noreferrer');
                }
            } elseif ($child->nodeType === XML_COMMENT_NODE) {
                $node->removeChild($child);
            }
        }
    }
}
