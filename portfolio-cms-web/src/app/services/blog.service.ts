import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';
import { Blog, CreateBlogDto } from '../models';

@Injectable({
  providedIn: 'root'
})
export class BlogService {
  private readonly baseUrl = `${environment.apiUrl}/blogs`;

  constructor(private http: HttpClient) {}

  getAll(publishedOnly: boolean = false, page: number = 1, pageSize: number = 10): Observable<Blog[]> {
    let params = new HttpParams()
      .set('publishedOnly', publishedOnly.toString())
      .set('page', page.toString())
      .set('pageSize', pageSize.toString());

    return this.http.get<Blog[]>(this.baseUrl, { params });
  }

  getMyBlogs(): Observable<Blog[]> {
    return this.http.get<Blog[]>(`${this.baseUrl}/my`);
  }

  getById(id: string): Observable<Blog> {
    return this.http.get<Blog>(`${this.baseUrl}/${id}`);
  }

  getBySlug(slug: string): Observable<Blog> {
    return this.http.get<Blog>(`${this.baseUrl}/slug/${slug}`);
  }

  create(blog: CreateBlogDto): Observable<Blog> {
    return this.http.post<Blog>(this.baseUrl, blog);
  }

  update(id: string, blog: CreateBlogDto): Observable<Blog> {
    return this.http.put<Blog>(`${this.baseUrl}/${id}`, { id, ...blog });
  }

  togglePublish(id: string, isPublished: boolean): Observable<Blog> {
    return this.http.put<Blog>(`${this.baseUrl}/${id}`, { isPublished });
  }

  delete(id: string): Observable<void> {
    return this.http.delete<void>(`${this.baseUrl}/${id}`);
  }
}
