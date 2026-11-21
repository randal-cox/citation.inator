// Real source metadata, with identifiers omitted where discovery is demonstrated.
// Lookup answers live separately and are never loaded by this page.
const light='Über einen die Erzeugung und Verwandlung des Lichtes betreffenden heuristischen Gesichtspunkt';
const brownian='Über die von der molekularkinetischen Theorie der Wärme geforderte Bewegung von in ruhenden Flüssigkeiten suspendierten Teilchen';
const relativity='Zur Elektrodynamik bewegter Körper';
const radiation='Ueber das Gesetz der Energieverteilung im Normalspectrum';
export const documentExamples={
 apa:`Einstein published on light quanta (Einstein, 1905) and special relativity (Einstein, 1905) in the same year. His Brownian-motion paper is also in the bibliography, so each short citation has three possible works.

Planck's radiation paper gives an unambiguous match with a page locator (Planck, 1901, p. 553). A deliberately incomplete citation has no bibliography entry (Missing, 2001).

## References

Einstein, A. (1905). ${light}. Annalen der Physik, 322(6), 132–148.

Einstein, A. (1905). ${brownian}. Annalen der Physik, 322(8), 549–560.

Einstein, A. (1905). ${relativity}. Annalen der Physik, 322(10), 891–921.

Planck, M. (1901). ${radiation}. Annalen der Physik, 309(3), 553–563.
`,
 chicago:`Einstein (1905, 132) discusses light quanta. Another 1905 paper concerns special relativity (Einstein 1905, 891). The bibliography includes three works that share this author and year.

Planck (1901, 553) supplies an unambiguous narrative citation.

## References

Einstein, Albert. 1905. “${light}.” Annalen der Physik 322 (6): 132–148.

Einstein, Albert. 1905. “${brownian}.” Annalen der Physik 322 (8): 549–560.

Einstein, Albert. 1905. “${relativity}.” Annalen der Physik 322 (10): 891–921.

Planck, Max. 1901. “${radiation}.” Annalen der Physik 309 (3): 553–563.
`,
 numeric:`Light quanta and special relativity use different numbered references [2] and [7]. A group cites both [2, 7]. The supplied DOIs retrieve metadata directly.

A deliberately missing bibliography number remains unresolved [99].

## References

7. Einstein A. ${relativity}. Annalen der Physik. 1905;322(10):891–921. https://doi.org/10.1002/andp.19053221004

2. Einstein A. ${light}. Annalen der Physik. 1905;322(6):132–148. https://doi.org/10.1002/andp.19053220607
`,
 books:`Choose a particular edition of a book (Dahl, 2024).

## References

Dahl, R. (2024). Fantastic Mr Fox.
`,
 real:`Try a single-author citation (Ioannidis, 2005). The later correction is a separate publication (Ioannidis, 2022).

This citation names two authors (Feinberg & Willer, 2019).

## References

Ioannidis, J. P. A. (2005). Why Most Published Research Findings Are False. PLOS Medicine, 2(8), e124.

Ioannidis, J. P. A. (2022). Correction: Why Most Published Research Findings Are False. PLOS Medicine, 19(8), e1004085.

Feinberg, M., & Willer, R. (2019). Moral reframing: A technique for effective and persuasive communication across political divides. Social and Personality Psychology Compass, 13(12), e12501.
`
};
