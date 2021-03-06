import { Component, OnInit, OnDestroy } from '@angular/core';
import { Subscription } from 'rxjs';

import { PostsService } from '../posts.service';
import { Post } from '../post.model';
import { PageEvent } from '@angular/material';
import { AuthService } from 'src/app/auth/auth.service';

@Component({
  selector: 'app-post-list',
  templateUrl: './post-list.component.html',
  styleUrls: ['./post-list.component.css']
})

export class PostListComponent implements OnDestroy, OnInit {

  private authListenerSubs = new Subscription();
  private postsSub: Subscription;
  posts: Post[] = [];
  isAuthenticated = false;
  userId: string;
  isLoading = false;
  totalPosts = 10;
  postForPage = 2;
  currentPage = 1;
  pageSize = [2, 4, 6];


  constructor(public postsService: PostsService, private authService: AuthService) {}

  ngOnInit() {
    this.postsService.getPosts(this.postForPage, this.currentPage);
    this.userId = this.authService.getUserId();
    this.isLoading = true;
    this.postsSub = this.postsService.getPostUpdateListener()
      .subscribe((postData: { posts: Post[], counterPosts: number }) => {
        this.isLoading = false;
        this.totalPosts = postData.counterPosts;
        this.posts = postData.posts;
      });
    this.isAuthenticated = this.authService.isAuth();
    this.authListenerSubs = this.authService.getAuthStatusListener().subscribe(isAuthenticated => {
      this.userId = this.authService.getUserId();
      this.isAuthenticated = isAuthenticated;
    });
  }

  onDelete(post: Post) {
    this.isLoading = true;
    this.postsService.deletePost(post)
      .subscribe(() => {
        this.postsService.getPosts(this.postForPage, this.currentPage);
      }, () => {
        this.isLoading = false;
      });
  }

  onChangePaginator(pageData: PageEvent) {
    this.isLoading = true;
    this.postForPage = pageData.pageSize;
    this.currentPage = pageData.pageIndex + 1;
    this.postsService.getPosts(this.postForPage, this.currentPage);
  }

  ngOnDestroy() {
    this.postsSub.unsubscribe();
    this.authListenerSubs.unsubscribe();
  }
}
