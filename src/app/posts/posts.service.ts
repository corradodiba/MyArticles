import { Injectable } from '@angular/core';
import { Subject } from 'rxjs';
import { map } from 'rxjs/operators';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';

import { environment } from '../../environments/environment';

import { Post } from './post.model';

const URL = `${environment.apiUrl}/posts/`;
@Injectable({
  providedIn: 'root'
})

export class PostsService {
  private posts: Post[] = [];
  private postsUpdated = new Subject<{posts: Post[], counterPosts: number}>();

  constructor(private http: HttpClient, private router: Router) {}

  navigateOnRouter(path: string) {
    if (path === '') {
      path = '/';
    }
    this.router.navigate([path]);
  }

  getPost(id: string) {
    return this.http.get<{message: string, post: {_id: string, title: string, content: string, imagePath: string, author: string}}>(
      URL + id
    );
  }

  getPosts(postsForPage: number, currentPage: number) {
    const query = `?pagesize=${postsForPage}&page=${currentPage}`;
    this.http
      .get<{message: string, posts: any, counterPosts: number}>(
        URL + query
      )
      .pipe(map((postsData) => {
        return {
          posts: postsData.posts.map(post => {
                  return {
                    title: post.title,
                    content: post.content,
                    id: post._id,
                    imagePath: post.imagePath,
                    author: post.author
                  };
                }),
          counterPosts: postsData.counterPosts
        };
      }))
      .subscribe((postStructure) => {
        this.posts = postStructure.posts;
        this.postsUpdated.next({
          posts: [...this.posts],
          counterPosts: postStructure.counterPosts
        });
      });
    return this.posts;
  }

  getPostUpdateListener() {
    return this.postsUpdated.asObservable();
  }

  addPost(titlePost: string, contentPost: string, imagePost: File) {
    const postData = new FormData();
    postData.append('title', titlePost);
    postData.append('content', contentPost);
    postData.append('image', imagePost, titlePost);

    this.http.post<{message: string, post: Post}>(URL, postData)
      .subscribe((data) => {
        this.navigateOnRouter('');
      });
  }

  updatePost(postId: string, postTitle: string, postContent: string, postImage: File | string) {
    let postData: Post | FormData;

    if (typeof postImage === 'object') {
      postData = new FormData();
      postData.append('id', postId),
      postData.append('title', postTitle);
      postData.append('content', postContent);
      postData.append('image', postImage);
    } else {
      postData = {
        id: postId,
        title: postTitle,
        content: postContent,
        imagePath: postImage,
        author: null
      };
    }
    this.http
      .put(URL + postId, postData)
      .subscribe(response => {
        this.navigateOnRouter('');
      });
  }

  deletePost(post: Post) {
    return this.http.delete(URL + post.id);
  }
}
