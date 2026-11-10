# Citation demo fixtures

Verified 2026-11-10. Preserve the original input and verification status. These records are test cases, not a claim that every work supports the surrounding project's argument.

## 1. Verified book with ISBN and JSTOR book DOI

Original:

> The Politics of Ritual, Molly Farneth, Princeton University Press (2023)

APA:

> Farneth, M. (2023). *The politics of ritual*. Princeton University Press. https://doi.org/10.2307/j.ctv2wr4wbd

Identifiers and destinations:

- DOI: `10.2307/j.ctv2wr4wbd`
- ISBN: `9780691198927`
- Publisher: https://press.princeton.edu/books/paperback/9780691198927/the-politics-of-ritual
- JSTOR: https://www.jstor.org/stable/j.ctv2wr4wbd

Useful failure mode: the publisher page emphasizes ISBN, while the platform-level book DOI is discovered elsewhere. Editions and electronic platform records must coexist.

## 2. Unresolved/nonexistent citation

Original:

> Ritual and the Politics of Reconciliation, in Ethnic Conflict and Peacemaking, OUP (2022)

Status: no matching work verified. Do not silently substitute *The Oxford Handbook of Religion, Conflict, and Peacebuilding*. Preserve as an unresolved negative fixture.

Expected behavior: parser succeeds; resolver returns no confident match; UI labels the record unresolved and offers correction/reporting rather than fabricating metadata.

## 3. Verified forthcoming/recent book without DOI

Original:

> A Time to Gather: How Ritual Created the World—and How It Can Save Us, Bruce Feiler, Penguin Press (2026)

APA:

> Feiler, B. (2026). *A time to gather: How ritual created the world—and how it can save us*. Penguin Press.

Identifiers and destinations:

- ISBN: `9780593656433`
- Publisher: https://www.penguinrandomhouse.com/books/738772/a-time-to-gather-by-bruce-feiler/
- Publication date: 2026-05-19

Useful failure mode: valid scholarly/relevant book with no DOI. ISBN must be first-class rather than treated as a deficient DOI record.

## 4. Verified open-access dissertation without confirmed DOI

Original supplied correction:

> Modern But Not Meaningless: Nonreligious Cultures and Communities in the United States, Jacqui Frost (dissertation, University of Minnesota)

APA:

> Frost, J. (2020). *Modern but not meaningless: Nonreligious cultures and communities in the United States* [Doctoral dissertation, University of Minnesota]. University of Minnesota Digital Conservancy.

Identifiers and destinations:

- Repository PDF: https://conservancy.umn.edu/bitstreams/a9ef5019-29d1-45ad-9bb1-a8d97bde44f5/download
- DOI: not confirmed

Useful failure mode: repository item has an accessible PDF, but search exposed a bitstream URL rather than a stable landing-page identifier. The resolver must not pretend a download URL is a persistent work identifier.

## 5. Verified article with DOI and public preprint

Original:

> "How Empathic Concern Fuels Political Polarization," Simas, Clifford and Kirkland, American Political Science Review 114(1), 2020

APA:

> Simas, E. N., Clifford, S., & Kirkland, J. H. (2020). How empathic concern fuels political polarization. *American Political Science Review, 114*(1), 258–269. https://doi.org/10.1017/S0003055419000534

Identifiers and destinations:

- DOI: `10.1017/S0003055419000534`
- Publisher article/PDF: https://www.cambridge.org/core/journals/american-political-science-review/article/how-empathic-concern-fuels-political-polarization/8115DB5BDE548FF6AB04DA661F83785E
- Author preprint: https://scottaclifford.com/wp-content/uploads/2012/02/SimasCliffordKirkland_Empathy-and-Polarization_Preprint.pdf

Useful failure mode: the open author manuscript and publisher version are distinct access locations and must carry version labels.

## 6. Verified article with DOI

Original:

> "Moral Reframing: A Technique for Effective and Persuasive Communication across Political Divides," Matthew Feinberg and Robb Willer, Social and Personality Psychology Compass (2019)

APA:

> Feinberg, M., & Willer, R. (2019). Moral reframing: A technique for effective and persuasive communication across political divides. *Social and Personality Psychology Compass, 13*(12), e12501. https://doi.org/10.1111/spc3.12501

Identifiers and destinations:

- DOI: `10.1111/spc3.12501`
- Publisher: https://compass.onlinelibrary.wiley.com/doi/10.1111/spc3.12501

Useful failure mode: electronic article number rather than page range.

## 7. Verified book with edition/platform identifiers

Original:

> Radical Empathy: Finding a Path to Bridging Racial Divides, Terri E. Givens, Policy Press (2021)

APA:

> Givens, T. E. (2021). *Radical empathy: Finding a path to bridging racial divides*. Policy Press. https://doi.org/10.46692/9781447357278

Identifiers and destinations:

- DOI: `10.46692/9781447357278`
- Hardback ISBN: `9781447357247`
- ePDF ISBN: `9781447357278`
- JSTOR DOI: `10.2307/j.ctv1d82h97`
- Cambridge/Bristol record: https://www.cambridge.org/core/books/radical-empathy/A8D8622ACC131496580E045D73168A01
- JSTOR: https://www.jstor.org/stable/j.ctv1d82h97

Useful failure mode: one conceptual work has multiple edition/platform identifiers. The component must not imply they are interchangeable files.

## 8. Verified ISBN-only book

Original:

> The Ritual Effect: From Habit to Ritual, Harness the Surprising Power of Everyday Actions, Michael Norton, Scribner (2024)

APA:

> Norton, M. I. (2024). *The ritual effect: From habit to ritual, harness the surprising power of everyday actions*. Scribner.

Identifiers and destinations:

- ISBN: `9781982153021`
- Publisher: https://www.simonandschuster.com/books/The-Ritual-Effect/Michael-Norton/9781982153021

Useful failure mode: ISBN and publisher record, no confirmed DOI.

## 9. Unresolved/nonexistent citation

Original:

> Deep Citizenship: Structural Rituals of Engagement, Cinema and Boggs (2023)

Status: no matching work verified. Preserve as negative fixture.

## 10. Unresolved/nonexistent citation

Original:

> The Spaces of Others: Heterotopias and Peace Building, M. Al-Farabi (2024)

Status: no matching work verified. Preserve as negative fixture.

## Demo coverage supplied by this set

- DOI article
- electronic article number
- book DOI
- ISBN-only book
- multiple platform/edition identifiers
- dissertation/repository PDF
- publisher versus author manuscript
- recent/forthcoming publication
- unresolved plausible-looking hallucination
- deliberately rejected substitution
